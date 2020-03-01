"use strict";
import Config from "./Config";

export function getAudioContext() {
  // construct Audio context once per session and re-use it
  // only construct a new context if one doesn't exist
  // starting AudioContext after user interaction prevents warning on chrome
  // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
  let ctx = new (window.AudioContext || window.webkitAudioContext)();
  // make sure context exists to prevent Safari iOS bug
  if (ctx) {
    // need to create a node in order to kick off the timer in Chrome.
    ctx.createGain();
  }
  return ctx;
}

// Converts a note duration to seconds
function _getNoteTimeDuration(noteDuration, bpm = 120, signature = [4, 4]) {
  let beatsPerSecond = bpm / 60;
  let secondsPerBeat = 1 / beatsPerSecond;
  let beatsPerNote = noteDuration / (signature[0] * signature[1]);
  return secondsPerBeat * beatsPerNote;
}

function _getMelodyTimeDuration(melody) {
  return melody.notes.reduce((time, note) => {
    return (
      time +
      _getNoteTimeDuration(note.duration, melody.bpm, melody.timeSignature)
    );
  }, 0);
}

function _getFrequency(pitch, octave) {
  return Config.frequencies[octave][pitch.toLowerCase()];
}

export function playTone(ctx, note, timeLine, tempo, timeSig, voice) {
  let playLength = _getNoteTimeDuration(note.duration, tempo, timeSig);

  if (note.name !== "rest") {
    let o = ctx.createOscillator();
    o.type = voice;
    o.frequency.value = _getFrequency(note.name, note.octave);
    o.start(timeLine);
    o.stop(timeLine + playLength);
    o.connect(ctx.destination);
  }

  return (timeLine += playLength);
}

// NOTE: turns out there is no need for an async play() wrapper.
/**
 * Plays a melody via Web Audio API
 * @param state {Object} Pointer to some in-memory state object with an "isPlaying" property
 * @param ctx {AudioContext | null} Audio Context for web audio API.
 * @param melody {Object} Melody to play.
 * @param time {number} Timeline start in seconds (double-precision float).
 * @param voice {string} Web Audio voice to play melody with (OscillatorNode.type)
 * @param stopCallback {Function}  Function to call when melody is done playing.
 * @returns {number} Current timeline time.
 */
export function playMelody(
  state,
  ctx = null,
  melody,
  time,
  voice,
  stopCallback = Function.prototype
) {
  let melodyLength = _getMelodyTimeDuration(melody);
  time = time || ctx.currentTime;
  state.isPlaying = true;

  for (let i = 0; i < melody.notes.length; i++) {
    time = playTone(
      ctx,
      melody.notes[i],
      time,
      melody.bpm,
      melody.timeSignature,
      voice
    );
  }
  setTimeout(() => {
    state.isPlaying = false;
    stopCallback();
  }, melodyLength * 1000);
  return time;
}

/**
 * Plays a melody on loop via Web Audio API
 * @param state {Object} Pointer to some in-memory state object with an "isPlaying" property
 * @param ctx {AudioContext | null} Audio Context for web audio API.
 * @param melody {Object} Melody to play.
 * @param time {number} Timeline start in seconds (double-precision float).
 * @param voice {string} Web Audio voice to play melody with (OscillatorNode.type)
 * @returns {number} Current timeline time.
 */
export function loopMelody(state, ctx = null, melody, time, voice) {
  let melodyLength = _getMelodyTimeDuration(melody);
  time = playMelody(state, ctx, melody, time || ctx.currentTime, voice);
  if (state.isPlaying) {
    state.timeoutIDs.push(
      setTimeout(() => {
        loopMelody(state, ctx, melody, time, voice);
      }, melodyLength * 1000)
    );
  }
}

/**
 * Stop a loop
 * @param state {Object} Pointer to some in-memory state object with an "isPlaying" property
 * @param ctx {AudioContext | null} Audio Context for web audio API.
 */
export function stopLoop(state, ctx) {
  if (state.timeoutIDs) {
    state.timeoutIDs.forEach(id => window.clearTimeout(id));
  }
  state.timeoutIDs = [];
  state.isPlaying = false;
}
