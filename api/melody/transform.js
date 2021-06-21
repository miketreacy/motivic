// This file exists to facilitate ZEIT NOW 2.0 serverless deployment
// https://zeit.co/guides/migrate-to-zeit-now
const {
    melody: melodyUtils,
    general: generalUtils,
    service: serviceUtils,
} = require('../_utils/Utils.js')
const { RequestError } = require('../_utils/Errors.js')

// Maps string keys to function values for reference by parameter variables in getTransformedMelody
const functionMap = {
    transpose,
    warp,
    invert,
    reverse,
    mensurate,
    augment,
    diminish,
    stagger,
}
/**
 * Transposes melody to another initial pitch.
 * @param {Object} melody Melody object.
 * @param {number} distance (signed integer) Transposition distance in half-steps from the leader's initial pitch.
 * @param {string} [mode] Name of mode to transpose to.
 * @param {string} [key] Name of key to transpose to.
 * @returns {Array} Transposed melody set.
 */
function transpose(melody, distance, mode, key) {
    let clone = generalUtils.clone(melody)
    let cloneNotes = clone.notes

    clone.mode = mode || clone.mode
    clone.key = key || clone.key
    clone.notes = []
    cloneNotes.forEach((note, i) => {
        let val = note.value !== null ? note.value + distance : note.value
        clone.notes.push(melodyUtils.getNote(val, note.duration, clone, i))
    })
    return clone
}

/**
 * Warps a melody's contour by multiplying the notes absolute distance from a given base pitch.
 * If no base pitch is given, the warp is applied relative to melody's mean or median pitch.
 * @param {Motif} melody Melody object.
 * @param {number} factor (signed integer OR float)
 * @param {string} baseNote Name of base note
 * @param {number|null} baseOctave Octave of base note
 */
//TODO: make sure this is working well with negative factors
// there may be a weird duration bug happening?
function warp(melody, factor = 1, baseNote = '', baseOctave = null) {
    // Param default values will not change melody, so just return it now
    if (factor === 1) {
        return melody
    }
    let clone = generalUtils.clone(melody)
    let cloneNotes = clone.notes
    let baseNoteValue = null
    if (baseNote) {
        baseOctave =
            baseOctave || melodyUtils.getMeanNotePropertyValue(melody, 'octave')
        baseNoteValue = melodyUtils.getNoteValue(baseNote, baseOctave)
    } else {
        baseNoteValue = melodyUtils.getMeanNotePropertyValue(melody, 'value')
    }
    clone.notes = []
    cloneNotes.forEach((note, i) => {
        let isNote = note.value !== null
        let noteValue = note.value
        if (isNote) {
            let distance = note.value - baseNoteValue
            let newDistance = distance * factor
            noteValue = baseNoteValue + newDistance
        }
        let newNote = melodyUtils.getNote(noteValue, note.duration, clone, i)
        clone.notes.push(newNote)
    })
    return clone
}

/**
 * Inverts melody via contrary motion from initial pitch.
 * @param {Array} melody Set of note maps. (see documentation above).
 * @returns {Array} Inverted melody set.
 */
function invert(melody) {
    let clone = generalUtils.clone(melody)
    let cloneNotes = clone.notes

    clone.notes = []
    cloneNotes.forEach((note, i, arr) => {
        let steps = note.steps === null ? null : note.steps * -1
        let val =
            steps === null
                ? null
                : melodyUtils.getInitialPitch(arr).value + steps
        clone.notes.push(melodyUtils.getNote(val, note.duration, clone, i))
    })
    return clone
}

/**
 * Retrogrades melody by reversing contour of the pitch, the rhythm, or both.
 * @param {Array} melody Set of note maps. (see documentation above).
 * @param {boolean} rhythm The rhythmic durations will be reversed.
 * @param {boolean} [pitch] The melodic contour will be reversed.
 * @returns {Array} Retrogradated melody set.
 */
function reverse(melody, rhythm, pitch) {
    let clone = generalUtils.clone(melody)
    let cloneNotes = clone.notes
    let retroNotes = generalUtils.reverseArr(cloneNotes)

    clone.notes = []
    cloneNotes.forEach((note, i) => {
        let retroNote = retroNotes[i]
        let isRest = retroNote.value === null
        let dur = rhythm ? retroNote.duration : note.duration
        let val = null

        if (!isRest) {
            val = pitch
                ? melodyUtils.getNoteValue(retroNote.name, retroNote.octave)
                : note.value
        }
        clone.notes.push(melodyUtils.getNote(val, dur, clone, i))
    })
    return clone
}

// TODO: adjust measure length of mensurated motif to account for duration changes to enable exact overlay on original melody.
/**
 * Mensurates melody by tranforming rhythmic duration values.
 * @param {Array} melody Set of note maps. (see documentation above).
 * @param {number} factor Mensuration factor to be applied to rhythmic durations.
 * @returns {Array} Mensurated melody set.
 */
function mensurate(melody, factor = 0) {
    if (factor) {
        let clone = generalUtils.clone(melody)
        let cloneNotes = clone.notes
        clone.notes = []
        cloneNotes.forEach((note, i) => {
            clone.notes.push(
                melodyUtils.getNote(
                    note.value,
                    note.duration * factor,
                    clone,
                    i
                )
            )
        })
        return clone
    } else {
        return melody
    }
}

/**
 * Mensurates melody by tranforming rhythmic duration values.
 * @param {Array} melody Set of note maps. (see documentation above).
 * @param {number} factor Augmentation factor to be applied to rhythmic durations.
 * @returns {Array} Augmented melody set.
 */
function augment(melody, factor) {
    return mensurate(melody, factor)
}

/**
 * Mensurates melody by tranforming rhythmic duration values.
 * @param {Array} melody Set of note maps. (see documentation above).
 * @param {number} factor Diminuition factor to be applied to rhythmic durations.
 * @returns {Array} Diminished melody set.
 */
function diminish(melody, factor) {
    return mensurate(melody, 1 / factor)
}

/**
 * Loops through the beats of the melody to find the delay splice point and
 * if splice point falls in the middle of a note, splits the note accordingly.
 */
// TODO: MODULARIZE THIS MESS - FUNCTION TOO LONG!!
// TODO: Refactor this to be functionally pure/immutable.
function stagger(melody, delay = 16) {
    let clone = generalUtils.clone(melody)
    let cloneNotes = clone.notes
    let noteIndex = melodyUtils.getNoteIndexAtBeat(cloneNotes, delay)
    let cleanBreak = cloneNotes[noteIndex].startingBeat === delay + 1
    let spliceNotes = []
    clone.notes = []
    if (cleanBreak) {
        spliceNotes = cloneNotes.splice(noteIndex)
    } else {
        cloneNotes = cloneNotes.reduce((arr, n, i) => {
            if (i === noteIndex) {
                arr = arr.concat([
                    {
                        value: n.value,
                        duration: delay - n.startingBeat,
                    },
                    {
                        value: n.value,
                        duration: n.duration + n.startingBeat - delay,
                    },
                ])
            } else {
                arr = arr.concat([n])
            }
            return arr
        }, [])
        spliceNotes = cloneNotes.splice(noteIndex + 1)
    }
    cloneNotes = spliceNotes.concat(cloneNotes)
    cloneNotes.forEach((n, i) =>
        clone.notes.push(melodyUtils.getNote(n.value, n.duration, clone, i))
    )
    return clone
}

// Takes a melody instance and an array of strings (function names) to apply to the melody in order
/**
 * Applies a series of given transformations to a given melody.
 * @param {Object} melody Melody with a notes array property.
 * @param {Array} transformations Array of objects.
 * @returns {*} transformed melody.
 */
function getTransformedMelody(melody = {}, transformations = []) {
    //TODO: only take array of melody.notes as input and disregard extraneous computed/meta properties?
    //TODO: reverse engineer all computed melody properties after melody.notes have been transformed?
    const badRequestError = new RequestError('Invalid request body')
    console.log(`getTransformedMelody() called with:`)
    console.info(`melody \n ${melody}`)
    console.info(`transformations \n ${transformations}`)
    if (melody.notes && melody.notes.length && transformations.length) {
        try {
            return transformations
                .map((o) => [o.type.toLowerCase(), o.params])
                .filter(([fn]) => typeof functionMap[fn] === 'function')
                .reduce(
                    (motif, [fn, args]) => functionMap[fn](motif, ...args),
                    melody
                )
        } catch (e) {
            throw new RequestError('Invalid request body')
        }
    } else {
        let reqParams = {
            melody: melody && melody.notes && melody.notes.length,
            transformations: transformations && transformations.length,
        }
        let message = Object.keys(reqParams).reduce((msg, field) => {
            msg += reqParams[field] ? '' : `${field} parameter requires length`
            return msg
        }, '')
        throw new RequestError(`Invalid request body: ${message}`)
    }
}

// TODO: melodic analyzer examines multiple dimensions of a melody
// in order to generate an intelligent counter-melody.
// The algorithm applies randomness to pre-set routines to maintain
// uniqueness.
// Melodic Dimensions to be analyzed:
// 1. Note duration patterns (rhythm): loops through all 64 beats and looks
// for clusters of rhythmic activity and inactivity to counterpoint.
// 2. Melodic contour patterns (melody): analyzes steps, skips, and leaps to
// counterpoint the shape of the melody.
// 3. Modal interval usage (harmony): looks at patterns of interval use and how
// best to harmonize them.
// 4. Add new 'CONTOUR WARP' transformation that takes a base note, a factor, and a melody and then
// multiplies or divides each melody note's distance from the base note by the given factor.
// analyze (melody) {
//
// }

module.exports = (req, res) => {
    try {
        const motif = getTransformedMelody(
            req.body.melody,
            req.body.transformations
        )
        res = serviceUtils.decorateResponseWithHeaders(res)
        res.json(serviceUtils.getResponse(req, motif))
    } catch (err) {
        return res.status(err.statusCode || 500).send(err.message)
    }
}
