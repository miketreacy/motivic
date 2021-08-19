'use strict'
import Config from './Config'
// TODO: complete this rudimentary stub of streaming MIDI output for controlling external sound modules

const NOTE_ON = 144
const NOTE_OFF = 128
const VELOCITY = 100

export function sendMIDINote(output, note, startTime, stopTime, audioCtx) {
    const pitch = note.value + 11
    const channel = 1
    const noteOnMessage = [NOTE_ON, pitch, VELOCITY]
    const noteOffMessage = [NOTE_OFF, pitch, VELOCITY]
    const now = window.performance.now()
    console.info(
        `sendMIDINote() now = ${now}\tstartTime = ${startTime}\tstopTime = ${stopTime}`
    )
    const timingOffset = now - audioCtx.currentTime * 1000
    startTime = startTime + timingOffset
    stopTime = stopTime + timingOffset
    output.send(noteOnMessage, startTime)
    output.send(noteOffMessage, stopTime)
}

export async function getMIDIAccess() {
    if (window.navigator.requestMIDIAccess) {
        return await window.navigator.requestMIDIAccess()
    } else {
        return null
    }
}

export async function getMIDIOutputs() {
    const midiAccess = await getMIDIAccess()
    return midiAccess ? Array.from(midiAccess.outputs.values()) : []
}

export function handleMidiConnection(callback = (access) => access) {
    function onMIDISuccess(midiAccess) {
        console.info('Now accessing your MIDI devices.')
        const outputs = Array.from(midiAccess.outputs.values())
        callback(midiAccess)
    }
    function onMIDIFailure() {
        console.info('Could not access your MIDI devices.')
    }

    if (window.navigator.requestMIDIAccess) {
        window.navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
        return true
    } else {
        console.info('MIDI access is not supported by the user agent.')
        return false
    }
}
