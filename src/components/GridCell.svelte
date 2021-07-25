<script>
    import { onMount, onDestroy, createEventDispatcher } from 'svelte'
    import MotivicUtils from '../MotivicUtils'
    import { newAudioContext, playTone } from '../Audio.js'
    export let defId
    export let width = 0
    export let height = 0
    export let cellColor
    export let column
    export let row
    export let label = false
    export let content = ''
    export let fontSize
    export let selected = false
    export let audioSession
    export let dragAndDrop = false
    export let itemId = ''

    const dispatch = createEventDispatcher()

    function handleDrop(dropTargetEl, data) {
        dispatch('cellDrop', {
            type: 'motif',
            id: data,
            row: row,
            column: column,
        })
    }

    let dragStartHandler = MotivicUtils.ui.getDragStartHandler('id')
    let dropHandler = MotivicUtils.ui.getDropHandler(handleDrop)

    function deSelectCell(el) {
        let tieId = el.dataset.tie_id
        el.classList.remove('selected')
        el.classList.remove('tied')
        el.classList.remove('tie-candidate')
        el.removeAttribute('data-tie_id')

        if (tieId) {
            let tieMates = document.querySelectorAll(`[data-tie_id="${tieId}"]`)
            if (tieMates.length === 1) {
                tieMates.forEach(unTieCell)
            }
        }
    }

    function unTieCell(el) {
        el.classList.remove('tied')
        el.classList.remove('tie-candidate')
    }

    function getTieMates(el) {
        let row = el.parentElement
        return row.querySelectorAll('.tie-candidate')
    }

    function tieCells(els, play) {
        console.dir(els)
        let randomId = MotivicUtils.general.randomString(8)
        els.forEach((el, i) => {
            play = play && i === els.length - 1
            selectCell(el, play)
            if (!el.classList.contains('tied')) {
                el.classList.add('tied')
                el.classList.remove('tie-candidate')
                console.info(`Cell Tied! column ${el.dataset.column}`)
                if (els.length > 1) {
                    let preTiedEl = [...els].find((el) => el.dataset.tie_id)
                    let tieId = preTiedEl ? preTiedEl.dataset.tie_id : randomId
                    el.setAttribute('data-tie_id', tieId)
                }
            }
            el.classList.remove('tie-candidate')
        })
    }

    function selectCell(el, play) {
        el.classList.add('selected')
        validateGrid(el)
        let rowData = el.parentElement.dataset
        let note = rowData.noteName
        let val = rowData.noteValue
        let beat = el.dataset.column
        el.setAttribute('data-note_value', val)
        el.setAttribute('data-note_name', note)
        console.log(`NOTE: ${note} VALUE: ${val} BEAT: ${beat}`)
        if (play) {
            playNote({
                name: note.slice(0, note.length - 1),
                octave: note.slice(note.length - 1, note.length),
                duration: 4,
            })
        }
    }

    function validateGrid(cellEl) {
        if (cellEl.classList.contains('selected')) {
            let cellCol = cellEl.dataset.column
            let colCells = document.querySelectorAll(
                `.selected[data-column="${cellCol}"]`
            )
            colCells.forEach((cell) => {
                if (cell !== cellEl) {
                    deSelectCell(cell)
                }
            })
        }
    }

    function validateCell(el) {
        el.classList.toggle('selected')
        if (el.classList.contains('selected')) {
            selectCell(el, true)
            tieCells(getTieMates(el), true)
        }
    }

    function playNote(note) {
        // TODO: sort out how to get these settings in this context
        let tempo = 120
        let timeSig = [4 / 4]
        let voice = 'square'
        playTone(audioSession.ctx, note, 0, tempo, timeSig, voice)
    }

    function mouseDownHandler(e) {
        let targEl = e.target
        if (
            targEl.classList.contains('cell') &&
            targEl.classList.contains('selected')
        ) {
            targEl.classList.add('tie-candidate')
            console.info(`mousedown!`)
        }
    }

    function mouseUpHandler(e) {
        let targEl = e.target
        if (targEl.classList.contains('cell')) {
            console.info(`mouseup!`)
            validateCell(targEl)
            console.log(
                `Cell Dragged: row ${targEl.parentElement.dataset.row} col ${targEl.dataset.columm}`
            )
        }
    }

    function mouseMoveHandler(e) {
        let targEl = e.target
        // if (targEl.classList.contains("cell")) {
        let dragged = e.buttons === 1
        if (dragged && !targEl.classList.contains('tie-candidate')) {
            targEl.classList.add('tie-candidate')
        }
        // }
    }

    $: disabled = !audioSession.ctx
</script>

{#if label}
    <text
        class="label"
        data-key-color={cellColor}
        {width}
        {height}
        x={column * width}
        y={row * height}
        dy={fontSize}
        font-size={fontSize}
    >
        {content}
    </text>
{:else if itemId}
    <g>
        <use
            class="cell"
            class:selected
            href="#{defId}"
            x={column * width}
            y={row * height}
            data-column={column}
            draggable={dragAndDrop}
            on:mousemove={mouseMoveHandler}
            on:mouseup={mouseUpHandler}
            on:mousedown={mouseDownHandler}
            on:dragstart={dragAndDrop ? dragStartHandler : (e) => false}
            on:dragend={dragAndDrop
                ? MotivicUtils.ui.dragendHandler
                : (e) => false}
            on:dragover={dragAndDrop
                ? MotivicUtils.ui.dragoverHandler
                : (e) => false}
            on:drop={dragAndDrop ? dropHandler : (e) => false}
        />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            >itemId</text
        >
    </g>
{:else}
    <use
        class="cell"
        class:selected
        href="#{defId}"
        x={column * width}
        y={row * height}
        data-column={column}
        draggable={dragAndDrop}
        on:mousemove={mouseMoveHandler}
        on:mouseup={mouseUpHandler}
        on:mousedown={mouseDownHandler}
        on:dragstart={dragAndDrop ? dragStartHandler : (e) => false}
        on:dragend={dragAndDrop ? MotivicUtils.ui.dragendHandler : (e) => false}
        on:dragover={dragAndDrop
            ? MotivicUtils.ui.dragoverHandler
            : (e) => false}
        on:drop={dragAndDrop ? dropHandler : (e) => false}
    />
{/if}

<style>
    .label {
        stroke: var(--theme_color_3);
        cursor: default;
    }
    .cell {
        fill: #eee;
        stroke: var(--theme_color_3);
        cursor: pointer;
        transition: fill 500ms ease 250ms;
    }

    .cell:hover {
        fill: orange;
    }

    .cell.selected {
        fill: green;
    }

    .cell.tie-candidate {
        fill: lightgreen;
    }

    .cell.tied {
        stroke-width: 0;
    }

    [href='#note-name'] {
        fill: var(--theme_color_3);
        stroke: var(--theme_color_3);
    }

    [data-key-color='white'] {
        fill: var(--theme_color_1);
        stroke: var(--theme_color_1);
    }

    .dragging {
        fill: yellowgreen;
    }

    .dragOver {
        stroke: yellow;
    }
</style>
