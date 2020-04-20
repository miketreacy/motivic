'use strict'
const { app: config } = require('./Config.json')
const Utils = {
    general: {
        /**
         * Generates and returns a random alphanumeric string. Will return only alpha or numeric
         * characters if optional type argument is passed.
         * @param {number} length The length of the random string we wish to generate.
         * @param {string} [type] Optional type of string (alpha or num).
         * @returns {string} A random alphanumeric string.
         */
        randomString: function (length, type = 'alphaNum') {
            let alpha = 'abcdefghijklmnopqrstuvwxyz'
            let num = '0123456789'
            let charMap = {
                alpha: alpha.toUpperCase() + alpha,
                num: num,
                alphaNum: num + alpha + num + alpha.toUpperCase() + num,
            }
            let text = ''

            for (let i = 0; i < length; i++) {
                let map = charMap[type]
                text += map.charAt(Math.floor(Math.random() * map.length))
            }
            return text
        },
        /**
         *
         * @param object
         */
        clone: function (object) {
            // TODO: find a less hacky approach to deep object cloning
            return JSON.parse(JSON.stringify(object))
        },

        reverseArr: function (arr) {
            let len = arr.length
            let idx = len - 1
            let result = []
            for (let i = idx; i + 1 > 0; i--) {
                result.push(arr[i])
            }
            return result
        },
        /**
         * Takes an array of primitive values and makes them unique.
         * @param {Array} arr An array
         * @returns {Array} unique array
         */
        unique: function (arr) {
            return [...new Set([...arr])]
        },
        /**
         * Sums an array of numbers
         * @param {number[]} arr Array of numbers
         * @returns {number} Sum of all array numbers
         */
        sum: function (arr) {
            return arr.reduce((sum, num) => sum + num, 0)
        },
        // Fisher-Yates Shuffle utility
        /**
         *
         * @param array
         * @returns {*}
         */
        shuffle: function (array) {
            let currentIndex = array.length
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                let randomIndex = Math.floor(Math.random() * currentIndex)
                currentIndex -= 1
                let temporaryValue = array[currentIndex]
                array[currentIndex] = array[randomIndex]
                array[randomIndex] = temporaryValue
            }
            return array
        },
        /**
         *
         * @param min
         * @param max
         * @param exclude
         * @returns {number}
         */
        getRandomInt: function (min = 1, max = 100, exclude) {
            let result = Math.round(Math.random() * (max - min) + min)

            if (exclude) {
                let intIsValid = result > exclude.max || result < exclude.min
                if (!intIsValid) {
                    result = this.getRandomInt(min, max, exclude)
                }
            }
            return result
        },

        roundToUnit: function (num, unit = config.default.note.duration.min) {
            let modulo = num % unit
            return num - modulo
        },

        getLowestVal: function (arr) {
            return arr.sort((a, b) => a - b)[0]
        },

        getHighestVal: function (arr) {
            return arr.sort((a, b) => b - a)[0]
        },
        /**
         * Limits the amount of times an event callback can be fired.
         * Good for attenuating the frequency of rapid i/o events (window.scroll, window.resize, data.stream).
         * @param {*} timeout An undefined variable to store a function in.
         * @param {function} cb A callback function to execute.
         * @param {number} interval  The number of milliseconds to wait before the callback can be fired again.
         * @param {Array} cbArgs Array of arguments to be applied to the callback function.
         */
        throttle: function (timeout, cb, interval, cbArgs) {
            // ignore events as long as a callback execution is in the queue
            cbArgs = cbArgs && cbArgs.length ? [...cbArgs] : null
            if (!timeout) {
                timeout = setTimeout(() => {
                    timeout = null
                    if (typeof cb === 'function') {
                        cb.apply(this, cbArgs)
                    }
                }, interval)
            }
        },

        /**
         * The "median" is the "middle" value in the list of numbers.
         * @param {Int32Array} numbers An array of numbers.
         * @return {Number} The calculated median value from the specified numbers.
         */
        getMedian: function (numbers) {
            let median = 0
            let len = numbers.length
            numbers.sort()

            // is even
            if (len % 2 === 0) {
                // average of two middle numbers
                median = (numbers[len / 2 - 1] + numbers[len / 2]) / 2
            } else {
                // is odd
                // middle number only
                median = numbers[(len - 1) / 2]
            }
            return median
        },
        /**
         * Gets the most common value (the mode) in a list of values. If more than
         * one value is tied for the highest frequency then it returns the highest
         * of those values.
         * @param {Array} arr List of values to parse
         * @returns {number} result
         */
        getMode: function (arr) {
            let mode = null
            if (!arr || !arr.length) {
                return mode
            }
            let modeMap = {}

            for (let i = 0; i < arr.length; i++) {
                let el = arr[i]
                if (el in modeMap) {
                    modeMap[el]++
                } else {
                    modeMap[el] = 1
                }
            }
            let maxCount = Math.max(...Object.values(modeMap))
            let results = Object.keys(modeMap)
                .filter((k) => modeMap[k] === maxCount)
                .map(parseInt)
            return Math.max(...results)
        },
    },
    melody: {
        getNoteIndexAtBeat: function (melodyArr, beat) {
            let breakNoteIndex = melodyArr.findIndex(
                (n) => n.startingBeat === beat + 1
            )
            let spliceNoteIndex = melodyArr.findIndex(
                (n) =>
                    n.startingBeat <= beat &&
                    n.startingBeat + n.duration >= beat
            )
            return [breakNoteIndex, spliceNoteIndex].filter(
                (int) => int > -1
            )[0]
        },

        /**
         * Returns an ordered reference set of scientific pitches up to and including the given octave number.
         * @param {number} [bot] Lowest octave to be included in set.
         * @param {number} top Highest octave to be included in set.
         * @param {string} initialPitch First pitch in set.
         * @returns {Array} Ordered set of scientific pitches from low to high.
         */
        getPitchSet: function (
            bot = config.default.octave.low,
            top = config.default.octave.high,
            initialPitch = config.default.note.pitch
        ) {
            let noteSet = Array.from(config.notes)
            let seq = this.sequencePitches(noteSet, initialPitch)
            let set = []

            for (let i = bot; i < top + 1; i++) {
                seq.forEach((n, idx) => {
                    set.push({
                        name: n,
                        octave: i,
                        value: i * 12 + idx + 1,
                    })
                })
            }
            return set
        },

        getKeySet: function (key, mode, pitches) {
            let keySet = []
            config.modes[mode].forEach((step) => {
                keySet.push(pitches[step].name)
            })
            return keySet
        },

        noteIsValid: function (noteName, set) {
            return set.includes(noteName) || noteName === 'rest'
        },

        // TODO: Allow for sharpening or flattening depending on location of nearest scale tone (currently just sharpens up to tone)
        // TODO: ~or~ Make it sharpen or flatten to scale depending on if new key is above or below existing key.
        /**
         * Transforms a given note value to fit a given scale.
         * @param {number} value Value to transform.
         * @param {Array} keySet Set of pitches in the desired scale.
         * @returns {number} Transformed pitch value.
         */
        transformNoteValue: function (value, keySet) {
            let newVal = value + 1
            let name = this.getNoteName(newVal)
            let result = newVal
            if (!this.noteIsValid(name, keySet)) {
                result = this.transformNoteValue(newVal, keySet)
            }
            return result
        },

        getNoteInterval: function (note, keySet) {
            return note.name === 'rest'
                ? null
                : keySet.findIndex((k) => k === note.name) + 1
        },

        getKeyFilteredValue: function (value, keySet) {
            let name = this.getNoteName(value)
            let result = value

            if (!this.noteIsValid(name, keySet)) {
                result = this.transformNoteValue(value, keySet)
            }
            return result
        },

        // the key defines the initial pitch
        // the mode defines the scale
        keyFilterMelody: function (melody) {
            let clone = this.clone(melody)
            let cloneNotes = clone.notes
            let pitchSet = this.getPitchSet(0, 0, clone.key)
            let keySet = this.getKeySet(clone.key, clone.mode, pitchSet)

            clone.notes = []
            cloneNotes.forEach((note, i) => {
                let val = this.getKeyFilteredValue(note.value, keySet)
                let newNote = this.getNote(val, note.duration, clone, i)
                clone.notes.push(newNote)
            })
            return clone
        },

        sequencePitches: function (pitches, pitch) {
            let tonicIndex = pitches.findIndex((p) => p === pitch)
            let set = pitches.splice(tonicIndex)
            set = set.concat(pitches)
            return set
        },

        /**
         * Filters through set of notes and returns the pitch of the first note that has a truthy pitch value.
         * @param {Array} melody Set of note maps.
         * @returns {string} Initial pitch of note set.
         */
        getInitialPitch: (melody) => {
            return melody.filter((n) => n.value)[0]
        },

        // TODO: one scope to rule them all, and in the closure bind them
        // TODO: calculates all computed properties based on the two crucial ones (value & duration)

        /**
         * Returns a new note object for a given value and duration.
         * @param {number} value Absolute value of note pitch.
         * @param {number} duration Duration of note in rhythmic units.
         * @param {Object} melody Represents a melody, complete or during generation.
         * @param {string} melody.key Key note of melody.
         * @param {string} melody.mode Mode (aka scale) of melody by name.
         * @param {Array} melody.notes Array of objects representing melody notes.
         * @param {number} noteIdx Index of note within melody array.
         * @returns {Object} New note instance.
         */
        getNote: function (
            value,
            duration,
            melody,
            noteIdx = melody.notes.length - 1
        ) {
            let key = melody.key || this.getInitialPitch(melody.notes)
            let mode = melody.mode || 'chromatic'
            let pitchSet = this.getPitchSet(0, 0, key)
            let keySet = this.getKeySet(key, mode, pitchSet)
            let isRest = value === null
            value = ((v) => {
                let val = v
                if (!isRest) {
                    val = val < 0 ? (val % 12) + 12 : val
                    val = this.getKeyFilteredValue(val, keySet)
                }
                return val
            })(value)
            let name = isRest ? 'rest' : this.getNoteName(value)
            let octave = isRest ? null : this.getNoteOctave(value)
            let pitch = name + (typeof octave === 'number' ? octave : '')
            let initialPitch = this.getInitialPitch(melody.notes)
            let steps = isRest
                ? null
                : value - (initialPitch ? initialPitch.value : value)
            let interval = this.getNoteInterval(
                {
                    name,
                },
                keySet
            )
            let startingBeat =
                melody.notes
                    .slice(0, noteIdx)
                    .reduce((total, note) => total + note.duration, 0) + 1
            return {
                value,
                name,
                octave,
                pitch,
                duration,
                steps,
                startingBeat,
                interval,
            }
        },

        getNoteValue: function (
            name = config.default.note.pitch,
            octave = config.default.note.octave
        ) {
            let octavePitches = this.getPitchSet(octave, octave)
            let match = octavePitches.filter(
                (p) => p.name === name.toLowerCase()
            )
            return match[0].value
        },

        /**
         * Gets note name from a given note value
         * @param {Number} value Can be integer or float
         * @returns {string}
         */
        getNoteName: function (value = config.default.note.value) {
            let roundValue = Math.round(value)
            let noteModulo = roundValue % 12
            let noteIndex = noteModulo ? noteModulo - 1 : 11
            let octavePitches = this.getPitchSet(0, 0)
            return octavePitches[noteIndex].name
        },

        getNoteOctave: function (value = config.default.note.value) {
            let noteModulo = value % 12
            return noteModulo
                ? Math.floor(value / 12)
                : Math.floor(value / 12) - 1
        },

        getMelodyLengthInMeasures: function (lengthType, lengthUnits) {
            //TODO: add parsing for time lengths (seconds, minutes, etc)
            //for now, falling back to measure length default
            return lengthType === config.default.length.type
                ? lengthUnits
                : config.default.length.units
        },

        getMelodyTempoInBPM: function (tempoType, tempoUnits) {
            //TODO: add parsing for qualitative tempo terms (andiamo, allegro, etc)
            //for now, falling back to bpm defaults
            return tempoType === config.default.tempo.type
                ? tempoUnits
                : config.default.tempo.units
        },

        // TODO: finish this guy! - will be huge for mensurated overlay
        /**
         * Curtails or extends melody to given measure length.
         * @param {Object} melody Represents a melody, complete or during generation.
         * @param {number} rhythmicUnits How many rhythmic units long should the melody be?
         * @returns {Object} Adjusted melody.
         */
        getLengthAdjustedMelody(melody, rhythmicUnits) {
            let clone = this.clone(melody)
            let cloneLength = clone.notes.reduce(
                (sum, note) => (sum += note.duration),
                0
            )
            let lengthModulo = rhythmicUnits % cloneLength
            let isShort = lengthModulo !== rhythmicUnits
        },

        /**
         * Gets the mean value for a given property of a given melody's notes
         * @param {Motif} melody
         * @param {string} propertyName
         * @returns {Number}
         */
        getMeanNotePropertyValue: function (melody, propertyName) {
            let noteValues = melody.notes
                .filter(this.filterOutRests)
                .map((n) => n[propertyName])
            let totalValues = noteValues.reduce((mean, val) => mean + val, 0)
            return Math.round(totalValues / noteValues.length)
        },

        /**
         * Gets the median value for a given property of a given melody's notes
         * @param {Motif} melody
         * @param {string} propertyName
         * @returns {Number}
         */
        getMedianNotePropertyValue: function (melody, propertyName) {
            let noteValues = melody.notes
                .filter(this.filterOutRests)
                .map((n) => n[propertyName])
            return Utils.general.getMedian(noteValues)
        },

        /**
         * Super simple callback to be passed to Array.filter()
         * @param {Note} note Note to filter
         * @returns {boolean} Is note.value truthy?
         */
        filterOutRests: function (note) {
            return note.value
        },

        /**
         * Returns the total length of a motif in a given time signature in a
         * given rhythmic unit.
         * @param {number} rhythmicUnit (int) Atomic rhythmic unit expressed as
         * the division of a whole note (1/x).
         * @param {number} measureCount (int) Number of motif measures.
         * @param {number} timeSigBeats (int) Time signature beats (top number).
         * @param {number} timeSigUnits (int) Time signature units (bottom number).
         * @returns {number} Motif length in beats.
         */
        getBeatLength: function (
            rhythmicUnit,
            measureCount,
            timeSigBeats,
            timeSigUnits
        ) {
            let rhythmicUnitsPerBeat = Math.floor(rhythmicUnit / timeSigUnits)
            let beatsPerMeasure = rhythmicUnitsPerBeat * timeSigBeats
            return beatsPerMeasure * measureCount
        },
    },
    service: {
        /**
         * Wraps api response with request params for client reference
         * and decorates payload with UTC timestamp in ISO 8601 format
         * @param {Object} req Express request object.
         * @param {Object} payload Response data.
         * @returns {Object} API response
         */
        getResponse: function (req, payload) {
            let reqParams = ['headers', 'method', 'url']
            const postParams = ['body']
            const getParams = ['params', 'query']
            reqParams =
                req.method === 'GET'
                    ? reqParams.concat(getParams)
                    : reqParams.concat(postParams)
            let reqMap = {}
            reqParams.forEach((key) => (reqMap[key] = req[key]))
            payload.created = new Date().toISOString()
            return { request: reqMap, response: payload }
        },

        decorateResponseWithHeaders: function (res) {
            res.setHeader('Content-Type', 'application/json')
            // Configuring CORS for all requests
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept'
            )
            return res
        },
    },
}

module.exports = Utils
