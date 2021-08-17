// TODO: complete this rudimentary stub of streaming MIDI output for controlling external sound modules

function sendMiddleC(midiAccess, portID) {
    var noteOnMessage = [0x90, 60, 0x7f] // note on, middle C, full velocity
    var output = midiAccess.outputs.get(portID)
    output.send(noteOnMessage) // sends the message.
}

function onMIDISuccess(midiAccess) {
    console.log(midiAccess)

    var inputs = midiAccess.inputs
    var outputs = midiAccess.outputs
    window.WMAoutputs = outputs
    sendMiddleC(midiAccess)
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.')
}

if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
}
