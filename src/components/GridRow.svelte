<script>
    import Config from '../Config'
    import MotivicUtils from '../MotivicUtils'
    import GridCell from './GridCell.svelte'
    export let itemType = 'note'
    export let itemName = ''
    export let itemValue = ''
    export let id = ''
    export let columns
    export let note = { name: '', value: 0 }
    export let row
    export let fontSize
    export let defId
    export let cellWidth = 0
    export let cellHeight = 0
    export let selections = []
    export let writable
    export let audioSession
    export let dragAndDrop = false
    export let cellType = 'simple'
    // an array of state objects for each cell
    export let state = []
    export let stateUpdaterFn = (state) => state

    function getCellColor() {
        return note.name[note.name.length - 1] === '#' ? 'black' : 'white'
    }

    function isCellSelected(column, row, selections) {
        let selected = selections.some(
            (coords) =>
                coords.length && coords[0] === column && coords[1] === row
        )
        return selected
    }
</script>

{#if itemType === 'note'}
    <g
        class="row"
        {id}
        data-row={row}
        data-note-name={`${note.name}${note.octave}`}
        data-note-value={note.value}
    >
        {#each MotivicUtils.general.range(columns, 1) as col}
            <GridCell
                type={cellType}
                {defId}
                {row}
                column={col}
                width={cellWidth}
                height={cellHeight}
                cellColor={getCellColor()}
                label={col === 1}
                content={note.name}
                {fontSize}
                selected={isCellSelected(col, row, selections)}
                {writable}
                {audioSession}
                {dragAndDrop}
            />
        {/each}
    </g>
{:else if itemType === 'motif'}
    <g class="row" {id} data-row={row}>
        {#each MotivicUtils.general.range(columns, 1) as col, idx}
            <GridCell
                type={cellType}
                state={state[idx]}
                {stateUpdaterFn}
                {defId}
                {row}
                column={col}
                width={cellWidth}
                height={cellHeight}
                cellColor={getCellColor()}
                label={col === 1}
                content={note.name}
                {fontSize}
                selected={isCellSelected(col, row, selections)}
                {writable}
                {audioSession}
                {dragAndDrop}
                on:cellChange
            />
        {/each}
    </g>
{/if}

<style>
</style>
