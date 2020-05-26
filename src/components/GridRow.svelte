<script>
    import Config from '../Config'
    import MotivicUtils from '../MotivicUtils'
    import GridCell from './GridCell.svelte'
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

    function getCellColor() {
        return note.name[note.name.length - 1] === '#' ? 'black' : 'white'
    }

    function isCellSelected(column, row, selections) {
        let selected = selections.some(
            coords => coords.length && coords[0] === column && coords[1] === row
        )
        return selected
    }
</script>

<style>

</style>

<g
    class="row"
    {id}
    data-row={row}
    data-note-name={`${note.name}${note.octave}`}
    data-note-value={note.value}>
    {#each MotivicUtils.general.range(columns, 1) as col}
        <GridCell
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
            {audioSession} />
    {/each}
</g>
