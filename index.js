// @ts-check
'use strict'

const volStep = 1000
const volWave = [0, 1, 3, 4, 3, 1, 0].map((v) => Math.sqrt(v) / 2)
const toneDuration = 1

const audioCtx = new window.AudioContext()
const oscillator = audioCtx.createOscillator()
const gainNode = audioCtx.createGain()
oscillator.connect(gainNode)
const panner = audioCtx.createStereoPanner()
gainNode.connect(panner)
panner.connect(audioCtx.destination)
panner.pan.value = 1
gainNode.gain.value = 0
oscillator.start()

const freqs = [1000, 1500, 2000, 3000, 4000, 6000, 8000, 1000, 750, 500]

/** @type {number[]} */
const vols = [...new Array(freqs.length * 2)].fill(0)
let step = 0,
  canChange = true

function play() {
  canChange = false
  const freq = freqs[step % freqs.length]
  oscillator.frequency.value = freq
  const max = vols[step] / volStep
  const volCurve = new Float32Array(volWave.map((v) => v * max))
  gainNode.gain.setValueCurveAtTime(volCurve, 0, toneDuration)
  updateDisableds()
  setTimeout(() => {
    canChange = true
    updateDisableds()
  }, toneDuration * 1000)
}

/** @type {HTMLButtonElement} */
const minusButton = document.querySelector('#minus')
minusButton.onclick = () => {
  vols[step]--
  play()
}

/** @type {HTMLButtonElement} */
const plusButton = document.querySelector('#plus')
plusButton.onclick = () => {
  vols[step]++
  play()
}

/** @type {HTMLButtonElement} */
const nextButton = document.querySelector('#next')
nextButton.onclick = () => {
  if (step++ === freqs.length - 1) {
    document.querySelector('#ear').innerHTML = 'Left'
    panner.pan.value = -1
  } else if (step === vols.length) {
    document.querySelector('main').innerHTML = 'Volumes: ' + vols.join(' ')
  }
  updateDisableds()
}

function updateDisableds() {
  nextButton.disabled = vols[step] > 0
  plusButton.disabled = vols[step] === volStep || !canChange
  minusButton.disabled = vols[step] < 1 || !canChange
}
updateDisableds()
