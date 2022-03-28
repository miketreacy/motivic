// This file exists to facilitate ZEIT NOW 2.0 serverless deployment
// https://zeit.co/guides/migrate-to-zeit-now
const {
    melody: melodyUtils,
    general: generalUtils,
    service: serviceUtils,
} = require('../_utils/Utils.js')
const { AppError, RequestError } = require('../_utils/Errors.js')
const { app: config } = require('../_utils/Config.json')

/**
 *
 * @param melody
 * @param octave
 * @param leap
 * @returns {{min: number, max: number, exclude: {min: *, max: *}}}
 * @private
 */
function getNoteValRange(melody, octave, leap) {
    let pitchArr = melody.filter((n) => n.value !== null)
    let lastPitchVal = pitchArr.length
        ? pitchArr[pitchArr.length - 1].value
        : null
    let octMin = melodyUtils.getNoteValue('c', octave.low)
    let octMax = melodyUtils.getNoteValue('b', octave.high)
    let minVal =
        leap.max && lastPitchVal !== null ? lastPitchVal - leap.max : octMin
    let maxVal =
        leap.max && lastPitchVal !== null ? lastPitchVal + leap.max : octMax
    return {
        min: Math.max(minVal, octMin),
        max: Math.min(maxVal, octMax),
        exclude: {
            min:
                leap.min && lastPitchVal !== null
                    ? lastPitchVal - leap.min - 1
                    : null,
            max:
                leap.min && lastPitchVal !== null
                    ? lastPitchVal + leap.min - 1
                    : null,
        },
    }
}

/**
 *
 * @param isRest
 * @param valRange
 * @param duration
 * @param melody
 * @param noteIdx
 * @returns {*|{value, name, octave, pitch, duration, steps, startingBeat, interval}}
 * @private
 */
function getRandomNote(isRest, valRange, duration, melody, noteIdx) {
    let noteVal = isRest
        ? null
        : generalUtils.getRandomInt(
              valRange.min,
              valRange.max,
              valRange.exclude
          )
    return melodyUtils.getNote(noteVal, duration, melody, noteIdx)
}

/**
 *
 * @param threshold
 * @returns {boolean}
 * @private
 */
function weight(threshold) {
    let chance = generalUtils.getRandomInt()
    return chance < threshold
}

// NOTE: Algorithmic filter sets ratio of pitches to rests at roughly 2:1
/**
 *
 * @param previousNote
 * @returns {string}
 * @private
 */
function getNoteType(previousNote) {
    let type = 'pitch'
    // Preventing consecutive rests.
    if (previousNote && previousNote.name !== 'rest') {
        type = weight(config.percentOfRests) ? 'rest' : 'pitch'
    }
    return type
}

/**
 * Generates a random rhythmic duration within given inclusive bounds.
 * @param {number} min Minimum note duration in atomic rhythmic units.
 * @param {number} max Maximum note duration in atomic rhythmic units.
 * @returns {*}
 * @private
 */
function getRandomDuration(min, max) {
    // NOTE: the parameter defaults are a conscious decision to normalize note durations
    // return generalUtils.roundToUnit(generalUtils.getRandomInt(min, max));
    return generalUtils.getRandomInt(min, max)
}

/**
 * Generates a random sequence of rhythmic durations that subdivide a given
 * number of beats with an optional min and max duration length.
 * @param {number} totalUnits Number of beats to generate.
 * @param {number} min Minimum note duration in atomic rhythmic units.
 * @param {number} max Maximum note duration in atomic rhythmic units.
 * @returns {number[]} Array of numbers representing note durations
 * in atomic rhythmic units.
 * @private
 */
function getRandomDurations(totalUnits, min, max) {
    // if min and max are the same and they cleanly divide into the total
    if (min === max && totalUnits % min === 0) {
        let length = totalUnits / min
        return Array(length).fill(min)
    }
    let results = []
    let unitsLeft = totalUnits

    while (unitsLeft > 0) {
        let newBeatMax = Math.min(max, unitsLeft)
        let newBeat = getRandomDuration(min, newBeatMax)
        let remainder = unitsLeft - newBeat
        if (remainder && remainder < min) {
            // This will yield an invalid final value, so intervene
            if (unitsLeft / 2 < min) {
                newBeat = unitsLeft
            } else {
                newBeat = unitsLeft - min
            }
        }
        results.push(newBeat)
        unitsLeft = unitsLeft - newBeat
    }

    // shuffle the results to disperse clumps
    return generalUtils.shuffle(validatedResults)
}

/**
 * Generates a random monophonic melody based on given parameters.
 * @param {string} key First note of scale.
 * @param {string} mode Note pattern of scale.
 * @param {number|null} octaveInit Initial octave in melody.
 * @param {number|null} octaveLow Lowest octave in melody.
 * @param {number|null} octaveHigh Highest octave in melody.
 * @param {string} pitchInit Initial pitch in melody.
 * @param {string} pitchLow Lowest pitch in melody.
 * @param {string} pitchHigh Highest pitch in melody.
 * @param {number} leapMin Minimum leap in steps between melody notes.
 * @param {number} leapMax Maximum leap in steps between melody notes.
 * @param {number|null} timeSignatureBeat Beats per measure.
 * @param {number|null} timeSignatureUnit Beat as division of a whole note.
 * @param {string} tempoType Method of declaring tempo, eg (bpm vs Italian tempo marking).
 * @param {number|null} tempoUnits Number of tempo units (n/a if using Italian tempo markings).
 * @param {string} lengthType Type of length declaration (measures vs time).
 * @param {number} lengthUnits Number of length units.
 * @param {number} noteDurMin Minimum note duration in rhythmic units.
 * @param {number} noteDurMax Maximum note duration in rhythmic unite.
 * @returns {
 * {id: (*|string), key: (*|string|string|IDBValidKey|IDBKeyRange|((index: number) => (string | null))),
 * mode: *, tempo: {tempoType: *, tempoUnits: string}, timeSignature: *[],
 * leap: {leapMin: number | * | ((...values: number[]) => number) | string,
 * leapMax: number | * | ((...values: number[]) => number) | string}, notes: Array}}
 */
function getRandomMelody({
    key = config.default.key,
    mode = config.default.mode,
    octave: {
        init: octaveInit = config.default.octave.init,
        low: octaveLow = config.default.octave.low,
        high: octaveHigh = config.default.octave.high,
    } = {},
    //TODO: handle a pitch config param and delimit melody range within it
    pitch: {
        init: pitchInit = config.default.pitch.init,
        low: pitchLow = config.default.pitch.low,
        high: pitchHigh = config.default.pitch.high,
    } = {},
    leap: {
        min: leapMin = config.default.leap.min,
        max: leapMax = config.default.leap.max,
    } = {},
    timeSignature: [
        timeSignatureBeat = config.default.timeSignature.beat,
        timeSignatureUnit = config.default.timeSignature.unit,
    ] = [],
    tempo: {
        type: tempoType = config.default.tempo.type,
        units: tempoUnits = config.default.tempo.units,
    } = {},
    length: {
        type: lengthType = config.default.length.type,
        units: lengthUnits = config.default.length.units,
    } = {},
    duration: {
        min: noteDurMin = config.default.noteDuration.min,
        max: noteDurMax = config.default.noteDuration.max,
    } = {},
} = {}) {
    console.info(`getRandomMelody() raw inputs`)
    console.dir(...arguments)

    // Name-spacing nested arguments because nested JS default params are a pain
    const octave = { init: octaveInit, low: octaveLow, high: octaveHigh }
    const pitch = { init: pitchInit, low: pitchLow, high: pitchHigh }
    const leap = { min: leapMin, max: leapMax }
    const tempo = { type: tempoType, units: tempoUnits }
    const length = { type: lengthType, units: lengthUnits }
    const timeSignature = [timeSignatureBeat, timeSignatureUnit]
    const duration = {
        min: Math.max(noteDurMin, config.default.noteDuration.min),
        max: Math.min(noteDurMax, config.default.noteDuration.max),
    }
    console.info(`getRandomMelody() formatted inputs`)
    console.info(`key = ${key}`)
    console.info(`mode = ${mode}`)
    console.info(`octave`)
    console.dir(octave)
    console.info('pitch')
    console.dir(pitch)
    console.info(`leap`)
    console.dir(leap)
    console.info(`duration`)
    console.dir(duration)
    console.info(`timeSignature`)
    console.dir(timeSignature)
    console.info(`tempo`)
    console.dir(tempo)
    console.info(`length`)
    console.dir(length)

    let inValidDurs = []
    for (let [k, v] of Object.entries(duration)) {
        let valid = config.noteDurationOptions.includes(v)
        if (!valid) {
            inValidDurs.push([k, v])
        }
    }

    if (inValidDurs.length) {
        let msg = `Invalid note duration parameters: ${inValidDurs
            .map(([k, v]) => `${v} is not a valid value for ${k}`)
            .join(', ')}`
        throw new RequestError(msg)
    }

    let melody = []
    let measures = melodyUtils.getMelodyLengthInMeasures(
        length.type,
        length.units
    )
    // TODO: calculate bpm from Italian tempo markings and return both
    let bpm = melodyUtils.getMelodyTempoInBPM(tempo.type, tempo.units)
    let motifBeatLength = melodyUtils.getBeatLength(
        config.rhythmicUnit,
        measures,
        timeSignatureBeat,
        timeSignatureUnit
    )
    let durations = getRandomDurations(
        motifBeatLength,
        duration.min,
        duration.max
    )
    let initialOctave =
        typeof octave.init === 'number'
            ? octave.init
            : generalUtils.getRandomInt(octave.low, octave.high)
    let initialValue = pitch.init
        ? melodyUtils.getNoteValue(pitch.init, initialOctave)
        : null

    durations.forEach((d, i) => {
        // Ensuring that rests will never be consecutive.
        // TODO: this loop is likely the source of the note duration min/max adherence bug
        let isRest = getNoteType(i > 0 ? melody[i - 1] : null) === 'rest'
        let valRange = getNoteValRange(melody, octave, leap)
        let isFirstPitch = !isRest && !melody.some((n) => n.name !== 'rest')
        let melodyMap = {
            key,
            mode,
            notes: melody,
        }
        try {
            let newNote =
                isFirstPitch && initialValue
                    ? melodyUtils.getNote(initialValue, d, melodyMap, i)
                    : getRandomNote(isRest, valRange, d, melodyMap, i)
            melody.push(newNote)
        } catch (err) {
            // this is likely because the leap min/max params exceed what
            // is possible within the given octave range
            throw new RequestError(
                `Leap range arguments (${leap.min} - ${leap.max}) conflict with octave range arguments (${octave.low} - ${octave.high})`
            )
        }
    })
    return {
        // NOTE: returning all parameter-derived properties (even though endpoint already returns request body)
        // because all arguments are optional and knowledge of default values may be of use to client.
        id: generalUtils.randomString(16),
        meta: {
            key,
            mode,
            octave,
            pitch,
            leap,
            timeSignature,
            tempo,
            bpm,
            length,
            duration,
        },
        notes: melody,
    }
}

module.exports = (req, res) => {
    try {
        const motif = getRandomMelody(req.body)
        //TODO: return all extraneous payload properties to client for convenience? 🤔
        res = serviceUtils.decorateResponseWithHeaders(res)
        res.json(serviceUtils.getResponse(req, motif))
    } catch (err) {
        return res.status(err.statusCode || 500).send(err.message)
    }
}
