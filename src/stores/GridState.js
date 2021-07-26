import { writable } from 'svelte/store'
import Config from '../Config.js'
import MotivicUtils from '../MotivicUtils'

/**
 * Higher-order function that takes a diffstate and returns a state reducer function
 * @param {Number} xIndex The x index of the grid cell that changed
 * @param {Number} yIndex The y index of the grid cell that changed
 * @param {Object} cellState The state of the grid cell that changed
 * @param {Function} [stateFilterFn=Function.prototype] A function that filters the state relative to the cellState change
 * @returns {Function} State reducer function that gets passed to Store.update()
 */
function cellStateUpdateFn(
    xIndex,
    yIndex,
    cellState,
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
        return stateFilterFn(xIndex, yIndex, cellValue, oldStateClone)
    }
}

function gridRowAdderUpdateFn(columns) {
    /**
     * Closes over outer diff state map and returns the new computed state
     * @param {Object} oldState Old state object
     * @returns {Object} new state object
     */
    return function stateReducer(oldState) {
        let oldStateClone = JSON.parse(JSON.stringify(oldState))
        // if there's no key specified, then the whole state is changing (like when a preset is selected)
        // TODO: update state.matrix to add an empty row
        return stateFilterFn(xIndex, yIndex, cellValue, oldStateClone)
    }
}

/**
 * Factory function to initialize a grid state store
 * @param {Object} initialState A map of the default grid state
 * @param {Function} [stateFilterFn=Function.prototype] A function that filters the state relative to the trigger key
 * @returns {Object} A grid state store instance
 */
function gridStateStoreFactory(
    initialState = { matrix: [] },
    stateFilterFn = Function.prototype
) {
    const { subscribe, unsubscribe, update, set } = writable(initialState)
    return {
        subscribe,
        unsubscribe,
        updateGridCell: (xIndex, yIndex, value) => {
            const stateReducer = cellStateUpdateFn(
                xIndex,
                yIndex,
                value,
                stateFilterFn
            )
            update(stateReducer)
        },
        addRow: (columns) => {
            const stateReducer = gridRowAdderUpdateFn(columns)
            update(stateReducer)
        },
        resetGrid: () => set(initialState),
    }
}

function labGridStateFilterFn(xIndex, yIndex, cellValue, oldStateClone) {
    oldStateClone.matrix[xIndex][yIndex] = cellValue
    return oldStateClone
}

// stores the state of the lab grid selection matrix
export const labGrid = gridStateStoreFactory(
    { matrix: [] },
    labGridStateFilterFn
)

export function initLabGrid(rows, columns) {
    const initialMatrix = Array(rows).fill(Array(columns).fill({}))
    const initialState = { matrix: initialMatrix }
    return gridStateStoreFactory(initialState, labGridStateFilterFn)
}
