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

/**
 * Updates the number of matrix rows in state.
 * If the new number of rows is greater than the existing matrix,
 * new default rows are populated to satisfy the desired number of rows.
 * @param {Number} numRows Number of desired rows in new grid state matrix
 * @param {Boolean} addRows Should the function add rows? (Will remove rows if false)
 * @returns {Function} stateReducer that gets passed old state
 */
function rowUpdateFn(numRows, addRows = true) {
    /**
     * Closes over outer diff state map and returns the new computed state
     * @param {Object} oldState Old state object
     * @returns {Object} new state object
     */
    return function stateReducer(oldState) {
        let oldStateClone = JSON.parse(JSON.stringify(oldState))
        // if there's no key specified, then the whole state is changing (like when a preset is selected)
        // TODO: update state.matrix to add an empty row
        let oldMatrix = oldStateClone.matrix
        let matrixColumnCount = oldMatrix[0].length
        let oldMatrixRowCount = oldMatrix.length
        let newNumRows = addRows
            ? oldMatrixRowCount + numRows
            : oldMatrixRowCount - numRows
        let newRows = Array(newNumRows).fill(Array(matrixColumnCount).fill({}))
        let newMatrix = newRows.reduce((matrix, row, idx, arr) => {
            let newRow = oldMatrix[idx] || row
            matrix.push(newRow)
            return matrix
        }, [])
        return newMatrix
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
        updateCell: (xIndex, yIndex, value) => {
            const stateReducer = cellStateUpdateFn(
                xIndex,
                yIndex,
                value,
                stateFilterFn
            )
            update(stateReducer)
        },
        addRows: (rowsToAdd) => {
            const stateReducer = rowUpdateFn(rowsToAdd, true)
            update(stateReducer)
        },
        removeRows: (rowsToRemove) => {
            const stateReducer = rowUpdateFn(rowsToRemove, false)
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
