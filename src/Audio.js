"use strict";
import Config from "./Config";
let win = window;
export const Audio = {
  context: null,
  attack: 1,
  release: 100,
  volume: 1,
  type: "sine",
  timeLine: 0,
  isPlaying: false
};

export function startAudioContext() {
  // starting AudioContext after user interaction prevents warning on chrome
  // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
  Audio.context = new (win.AudioContext || win.webkitAudioContext)();
  // need to create a node in order to kick off the timer in Chrome.
  Audio.context.createGain();
  return Audio.context;
}

export function getPlayState() {
  return Audio.isPlaying;
}

export function setPlayState(isPlaying) {
  Audio.isPlaying = isPlaying;
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
 * @param melody {Object} Melody to play.
 * @param time {number} Timeline start in seconds (double-precision float).
 * @param voice {string} Web Audio voice to play melody with (OscillatorNode.type)
 * @param stopCallback {Function}  Function to call when melody is done playing.
 * @returns {number} Current timeline time.
 */
export function playMelody(
  melody,
  time,
  voice,
  stopCallback = Function.prototype
) {
  let ctx = Audio.context;
  let melodyLength = _getMelodyTimeDuration(melody);
  time = time || ctx.currentTime;
  setPlayState(true);

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
    setPlayState(false);
    stopCallback();
  }, melodyLength * 1000);
  return time;
}

/**
 * Plays a melody on loop via Web Audio API
 * @param melody {Object} Melody to play.
 * @param time {number} Timeline start in seconds (double-precision float).
 * @param voice {string} Web Audio voice to play melody with (OscillatorNode.type)
 * @returns {number} Current timeline time.
 */
export function loopMelody(melody, time, voice) {
  let ctx = Audio.context;
  let melodyLength = _getMelodyTimeDuration(melody);
  time = playMelody(melody, time || ctx.currentTime, voice);
  if (getPlayState()) {
    ctx.timeoutIDs = ctx.timeoutIDs || [];
    ctx.timeoutIDs.push(
      setTimeout(() => {
        loopMelody(melody, time, voice);
      }, melodyLength * 1000)
    );
  }
}

export function stopLoop() {
  if (Audio.context.timeoutIDs) {
    Audio.context.timeoutIDs.forEach(id => window.clearTimeout(id));
  }
  Audio.context.timeoutIDs = [];
  setPlayState(false);
}
