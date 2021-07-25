<script>
    import MotivicUtils from '../MotivicUtils'
    import GridRow from './GridRow.svelte'
    export let id = ''
    export let width
    export let height
    export let rows
    export let columns
    export let labelSet
    export let viewBox = ''
    export let selections = [[]]
    export let writable = true
    export let audioSession
    export let dragAndDrop = false

    let defId = 'cell'
    let fontSize
    let cellWidth
    let cellHeight
    let pitches = labelSet.reverse()

    const gridDisplayColumns = [8, 16, 32, 64]
    const gridDisplayWidth = 300
    const gridDisplayHeight = 300
    const gridDimensionsMap = {
        small: 300,
        medium: 400,
        large: 500,
    }
    const gridLabelSizeMap = {
        small: { width: 20, fontSize: 12, yOffset: -9 },
        medium: { width: 30, fontSize: 15, yOffset: -13 },
        large: { width: 40, fontSize: 20, yOffset: -17 },
    }
    let innerWidth

    function getCellDimension(dimension, units) {
        return dimension / units
    }

    function getFontSize(height) {
        return height / 37.5
    }

    $: cellWidth = getCellDimension(width, columns)
    $: cellHeight = getCellDimension(height, rows)
    $: fontSize = getFontSize(height)
</script>

<svelte:window bind:innerWidth />

<svg class="grid" {id} {width} {height} {viewBox} overflow="scroll">
    <defs>
        <rect id={defId} x="0" y="0" width={cellWidth} height={cellHeight} />
    </defs>
    <g {id}>
        {#each MotivicUtils.general.range(rows, 1) as row, idx}
            <GridRow
                {defId}
                {row}
                {columns}
                {cellWidth}
                {cellHeight}
                note={pitches[idx]}
                {selections}
                {fontSize}
                {writable}
                {audioSession}
                {dragAndDrop}
            />
        {/each}
    </g>
</svg>

<style>
    .grid {
        display: flex;
        flex: 0 0 auto;
    }
</style>
