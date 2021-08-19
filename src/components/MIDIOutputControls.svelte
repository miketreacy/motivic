<script>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte'
    import { fade } from 'svelte/transition'

    import { getMIDIAccess } from '../MIDI'
    import DropDown from './DropDown.svelte'

    export let connectedOutput = null
    export let connecting = false

    let midiAccess = null
    let midiOutputs = []
    let selectedOutputId = ''

    console.info(`MIDIOutputControls.connecting = ${connecting}`)

    const dispatch = createEventDispatcher()

    function connectMidiOutput(outputId) {
        dispatch('midiOutputConnection', midiAccess.outputs.get(outputId))
    }

    function selectMidiOutput(event) {
        selectedOutputId = event.detail.selection
        console.info(`selected MIDI output = ${selectedOutputId}`)
        connectMidiOutput(selectedOutputId)
    }

    $: midiOutputs = midiAccess
        ? Array.from(midiAccess.outputs.values())
        : [{ name: 'select device', id: null }]

    onMount(async () => {
        midiAccess = await getMIDIAccess()
    })

    onDestroy(async () => {})
</script>

<section id="midi">
    <div class="midi-output-controls" class:disabled={connecting}>
        <label for="midi-outputs">MIDI Output Device</label>
        <DropDown
            id="midi-outputs"
            options={midiOutputs}
            displayCompact={false}
            disabled={false}
            multiDim={false}
            optionIds={true}
            on:updateSelection={selectMidiOutput}
        />

        <!-- <button disabled={connecting} on:click={connectMidiOutput}>
            {#if connecting}
                <div
                    class="spinner"
                    transition:fade
                    class:disabled={connecting}
                />
            {:else}
                <span>connect</span>
            {/if}
        </button> -->
    </div>
</section>

<style>
    .midi-output-controls {
        /* min-height: 200px; */
        padding: 20px 0;
        background-color: var(--theme_color_5);
        flex-direction: column;
    }
    div {
        width: 100%;
        border-radius: 5px;
        background-color: var(--theme_color_1);
    }
    div.disabled {
        background-color: var(--theme_color_4);
    }
    button {
        flex-direction: column;
        flex: 1 1 0;
        width: 100%;
        font-size: var(--theme_font_size_3);
    }
    label {
        padding: 20px;
        flex: 1 1 0;
    }
</style>
