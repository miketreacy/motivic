import { writable } from 'svelte/store'
import Config from '../Config.js'
import MotivicUtils from '../MotivicUtils'

/**
 * Higher-order function that takes a diffstate and returns a state reducer function
 * @param {Object} diffState A map of the changed state
 * @param {string} [key=''] The state key that triggered the change
 * @param {Function} [stateFilterFn=Function.prototype] A function that filters the state relative to the trigger key
 * @returns {Function} State reducer function that gets passed to Store.update()
 */
function formStateUpdateFn(
    diffState,
    key = '',
    stateFilterFn = Function.prototype
) {
    /**
     * Closes over outer diff state map and returns the new computed state
     * @param {Object} oldState Old state object
     * @returns {Object} new state object
     */
    return function stateReducer(oldState) {
        let oldStateClone = JSON.parse(JSON.stringify(oldState))
        // if there's no key specified, then the whole state is changing (like when a preset is selected)
        let newState = key
            ? stateFilterFn(key, diffState, oldStateClone)
            : diffState

        newState = Object.entries(newState).reduce((state, [k, v]) => {
            state[k] = v
            return state
        }, oldStateClone)
        return newState
    }
}

function formStateStoreFactory(
    initialState = {},
    stateFilterFn = Function.prototype
) {
    const { subscribe, unsubscribe, update, set } = writable(initialState)
    return {
        subscribe,
        unsubscribe,
        updateForm: (diffState, field = '') => {
            const stateReducer = formStateUpdateFn(
                diffState,
                field,
                stateFilterFn
            )
            update(stateReducer)
        },
        resetForm: () => set(initialState),
    }
}

function validateMinMaxFields(field, minField, maxField, newState, oldState) {
    let minVal = oldState[minField]
    let maxVal = oldState[maxField]
    if (field === minField) {
        minVal = newState[field]
        maxVal = Math.max(minVal, maxVal)
    }
    if (field === maxField) {
        maxVal = newState[field]
        minVal = Math.min(maxVal, minVal)
    }
    newState[minField] = minVal
    newState[maxField] = maxVal
    return newState
}

/**
 * Makes sure that the possible min/max leap values are updated
 * to reflect reality when the low/high octave selections change.
 * example: a one octave range can not accomadate leaps of an octave or more.
 *
 */
function adjustLeapsByOctaves(newState, oldState) {
    let lowOct = newState['octave_low'] || oldState['octaveLow']
    let highOct = newState['octave_high'] || oldState['octave_high']
    let minNoteVal = MotivicUtils.melody.getNoteValue('c', lowOct)
    let maxNoteVal = MotivicUtils.melody.getNoteValue('b', highOct)
    let noteValRange = maxNoteVal - minNoteVal + 1
    let leapMax = Math.min(oldState['leap_max'], noteValRange - 1)
    let leapMin = Math.min(oldState['leap_min'], leapMax - 6)
    newState['leap_max'] = leapMax
    newState['leap_min'] = leapMin
    return newState
}

function randomizerStateFilterFn(field, newState, oldState) {
    if (!field) {
        return newState
    }
    if (field.includes('octave_')) {
        newState = validateMinMaxFields(
            field,
            'octave_low',
            'octave_high',
            newState,
            oldState
        )
        newState = adjustLeapsByOctaves(newState, oldState)
    }
    if (field.includes('leap_')) {
        newState = validateMinMaxFields(
            field,
            'leap_min',
            'leap_max',
            newState,
            oldState
        )
    }
    if (field.includes('duration_')) {
        newState = validateMinMaxFields(
            field,
            'duration_min',
            'duration_max',
            newState,
            oldState
        )
    }
    newState.preset_id = 'preset-none'
    return newState
}

function transformerStateFilterFn(field, newState, oldState) {
    if (!field) {
        return newState
    }
    newState.preset_id = 'preset-none'
    return newState
}

export const randomizer = formStateStoreFactory(
    Config.formDefaults.randomizer,
    randomizerStateFilterFn
)
export const transformer = formStateStoreFactory(
    Config.formDefaults.transformer,
    transformerStateFilterFn
)
