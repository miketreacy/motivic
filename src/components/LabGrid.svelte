<script>
    import { onMount, onDestroy } from 'svelte'
    import { newAudioContext } from '../Audio.js'
    import Grid from './Grid.svelte'

    export let horizontalGrids = 1
    export let state = {}
    export let motifLengths = 4
    export let voiceLanes = []

    let audioSession = { ctx: null, isPlaying: false, timeoutIDs: [] }
    let width = 800
    let height = 50
    let viewColumns = horizontalGrids * motifLengths
    let rows = Math.max(voiceLanes.length, 1)

    function getGridViewBox(width, height, columns, rows, horizontalGrids) {
        let x = width / columns + 1
        let y = height / rows
        let viewBox = `${x} ${y} ${width} ${height}`
        console.info(`getGridViewBox() ${viewBox}`)
        return viewBox
    }

    function cellDropHander(event) {
        const data = event.detail
        console.info(
            `cellDropHandler() called! on ${data.type} id: ${data.id} at row: ${data.row} column: ${data.column}`
        )
    }

    onMount(() => {
        // only instantiate one AudioContext per grid session
        audioSession.ctx = newAudioContext()
    })

    onDestroy(async () => {
        await audioSession.ctx.close()
        // delete Audio.context to prevent memory leak
        delete audioSession.ctx
    })

    $: gridViewBox = getGridViewBox(
        width,
        height,
        viewColumns,
        rows,
        horizontalGrids
    )
    $: voiceLaneNames = voiceLanes.map((l) => l.label)
</script>

<div id="grid-wrap" style={`width: ${width}px;`}>
    <Grid
        id="svg-grid"
        width={width * horizontalGrids}
        {height}
        {rows}
        columns={motifLengths}
        viewBox={gridViewBox}
        labelSet={voiceLaneNames}
        dragAndDrop={true}
        writable={true}
        {audioSession}
        on:cellDrop={cellDropHander}
    />
</div>

<style></style>
