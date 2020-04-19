'use strict'
import Config from './Config'

export function newAudioContext() {
    // construct Audio context once per session and re-use it
    // only construct a new context if one doesn't exist
    // starting AudioContext after user interaction prevents warning on chrome
    // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
    let ctx = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'playback',
        sampleRate: 44000,
    })
    // make sure context exists to prevent Safari iOS bug
    if (ctx) {
        // need to create a node in order to kick off the timer in Chrome.
        ctx.createGain()
    }
    return ctx
}

/**
 * Gets the duration of a note in seconds.
 * @param {number} rhythmicUnit (int) Atomic rhythmic unit expressed as the division of a whole note (1/x).
 * @param {number} noteDuration (int) Note duration in rhythmic units.
 * @param {number} bpm (int) Tempo in Beats Per Minute.
 * @param {number} timeSignatureUnits Time signature units (note division that gets one beat).
 * Defaults to 4 which means a quarter note equals one beat.
 * @returns {number} (float) Note duration in seconds.
 */
function _getNoteTimeDuration(
    rhythmicUnit,
    noteDuration,
    bpm = 120,
    timeSignatureUnits = 4
) {
    let beatsPerSecond = bpm / 60
    let secondsPerBeat = 1 / beatsPerSecond
    let rhythmicUnitsPerBeat = rhythmicUnit / timeSignatureUnits
    let beatsPerNote = noteDuration / rhythmicUnitsPerBeat
    return secondsPerBeat * beatsPerNote
}

function _getMelodyTimeDuration(melody) {
    return melody.notes.reduce((time, note) => {
        return (
            time +
            _getNoteTimeDuration(
                Config.rhythmicUnit,
                note.duration,
                melody.meta.tempo.units,
                melody.meta.timeSignature[1]
            )
        )
    }, 0)
}

function _getFrequency(pitch, octave) {
    return Config.frequencies[octave][pitch.toLowerCase()]
}
/**
 *
 * @param {*} ctx
 * @param {*} note
 * @param {*} timeLine
 * @param {*} tempo
 * @param {*} timeSig
 * @param {*} voice
 */
export function playTone(ctx, note, timeLine, tempo, timeSig, voice) {
    let playLength = _getNoteTimeDuration(
        Config.rhythmicUnit,
        note.duration,
        tempo,
        timeSig[1]
    )

    if (note.name !== 'rest') {
        let o = ctx.createOscillator()
        o.type = voice
        o.frequency.value = _getFrequency(note.name, note.octave)
        o.start(timeLine)
        o.stop(timeLine + playLength)
        o.connect(ctx.destination)
    }

    return (timeLine += playLength)
}

// NOTE: turns out there is no need for an async play() wrapper.
/**
 * Plays a melody via Web Audio API
 * @param session {Object} Pointer to an instance of AudioSession
 * @param melody {Object} Melody to play.
 * @param time {number} Timeline start in seconds (double-precision float).
 * @param voice {string} Web Audio voice to play melody with (OscillatorNode.type)
 * @param stopCallback {Function}  Function to call when melody is done playing.
 * @returns {number} Current timeline time.
 */
export function playMelody(
    session,
    melody,
    time,
    voice,
    stopCallback = Function.prototype
) {
    let melodyLength = _getMelodyTimeDuration(melody)
    time = time || session.ctx.currentTime
    session.isPlaying = true

    for (let i = 0; i < melody.notes.length; i++) {
        time = playTone(
            session.ctx,
            melody.notes[i],
            time,
            melody.meta.tempo.units,
            melody.meta.timeSignature,
            voice
        )
    }
    setTimeout(() => {
        session.isPlaying = false
        stopCallback()
    }, melodyLength * 1000)
    return time
}

/**
 * Plays a melody on loop via Web Audio API
 * @param session {Object} Pointer to an instance of AudioSession
 * @param melody {Object} Melody to play.
 * @param time {number} Timeline start in seconds (double-precision float).
 * @param voice {string} Web Audio voice to play melody with (OscillatorNode.type)
 * @returns {number} Current timeline time.
 */
export function loopMelody(session, melody, time, voice) {
    let melodyLength = _getMelodyTimeDuration(melody)
    time = playMelody(session, melody, time || session.ctx.currentTime, voice)
    if (session.isPlaying) {
        session.timeoutIDs.push(
            setTimeout(() => {
                loopMelody(session, melody, time, voice)
            }, melodyLength * 1000)
        )
    }
}

/**
 * Stops a loop
 * @param session {Object} Pointer to an instance of AudioSession
 */
export function stopLoop(session) {
    if (session.timeoutIDs) {
        session.timeoutIDs.forEach((id) => window.clearTimeout(id))
    }
    session.timeoutIDs = []
    session.isPlaying = false
}
