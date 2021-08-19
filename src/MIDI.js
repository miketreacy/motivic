'use strict'
import Config from './Config'
// TODO: complete this rudimentary stub of streaming MIDI output for controlling external sound modules

const NOTE_ON = 144
const NOTE_OFF = 128
const VELOCITY = 100

export function sendMIDINote(output, note, durationSeconds) {
    console.info(output.send.toString())
    // TODO: convert Motif.note to:
    // 1. MIDI note on message
    // 2. MIDI note off message
    let pitch = note.value + 11
    let noteOnMessage = [NOTE_ON, pitch, VELOCITY]
    let noteOffMessage = [NOTE_OFF, pitch, VELOCITY]

    // TODO: convert the duration to milliseconds
    let durationMilliseconds = durationSeconds * 1000
    let delay = window.performance.now() + durationMilliseconds
    output.send(noteOnMessage)
    output.send(noteOffMessage, delay)
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
