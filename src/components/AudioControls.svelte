<script>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte'
    import Config from '../Config'
    import MotivicUtils from '../MotivicUtils'
    import {
        newAudioContext,
        playMelody,
        loopMelody,
        stopLoop,
    } from '../Audio.js'
    import DropDown from './DropDown.svelte'
    export let selectedVoice = 'sine'
    export let selectedMotifs = []
    export let displayCompact = false
    export let midiOutput = null
    let isPlaying = false
    let isLooping = false
    let disabled = true
    let AudioSession = {
        ctx: null,
        isPlaying: false,
        timeoutIDs: [],
        midiOutput: midiOutput,
    }
    const timelineStart = 0
    const waveFormIconMap = {
        sawtooth: '&#8961',
        sine: '&#8767;',
        square: '&#9633;',
        triangle: '&#9651;',
    }
    const dispatch = createEventDispatcher()

    function getVoiceOptionDisplay(voice, shortName, isCompact = false) {
        let padTotal = isCompact ? 5 : 10
        let str = isCompact ? shortName : voice
        returnMotivicUtils.general.leftPad(str, padTotal)
    }

    function stopMotifLoop() {
        isPlaying = false
        isLooping = false
        AudioSession.isPlaying = false
        stopLoop(AudioSession)
    }

    function playMotifs(motifs) {
        isPlaying = true
        motifs.forEach((motif) =>
            playMelody(
                AudioSession,
                motif,
                timelineStart,
                selectedVoice,
                () => (isPlaying = false)
            )
        )
    }

    function playClickHandler(e) {
        if (AudioSession.isPlaying) {
            return false
        }
        if (selectedMotifs.length) {
            playMotifs(selectedMotifs)
        }
    }

    function loopMotifs(motifs) {
        isPlaying = true
        isLooping = true
        motifs.forEach((motif) =>
            loopMelody(AudioSession, motif, timelineStart, selectedVoice)
        )
    }

    function loopClickHandler(e) {
        if (AudioSession.isPlaying) {
            stopMotifLoop()
        } else {
            if (selectedMotifs.length) {
                loopMotifs(selectedMotifs)
            }
        }
    }

    function selectVoice(event) {
        selectedVoice = event.detail.selection
    }

    onMount(() => {
        AudioSession.ctx = newAudioContext()
    })

    onDestroy(async () => {
        await AudioSession.ctx.close()
        // delete Audio.context to prevent memory leak
        delete AudioSession.ctx
    })

    $: disabled = !AudioSession.ctx || !selectedMotifs.length
</script>

<!-- Don't display AudioControls if playback is impossible -->
{#if AudioSession.ctx}
    <DropDown
        id="voice-control"
        options={Config.audio.voices}
        {displayCompact}
        {disabled}
        optionIconMap={Config.waveformIconMap}
        on:updateSelection={selectVoice}
    />

    <button
        class="play"
        class:compact={displayCompact}
        class:playing={isPlaying}
        {disabled}
        on:click={playClickHandler}
    >
        {#if !displayCompact}
            <span>&#9658;</span>
        {/if}
        <span>play</span>
    </button>

    <button
        class="loop"
        class:compact={displayCompact}
        class:playing={isLooping}
        {disabled}
        on:click={loopClickHandler}
    >
        {#if !displayCompact}
            <span>&infin;</span>
        {/if}
        <span>loop</span>
    </button>
{/if}

<style>
    .playing {
        color: var(--theme_color_9);
    }

    button > span {
        flex: 1 1 0;
    }
    button.compact {
        max-width: 60px;
        min-width: var(--touch);
        margin: 0px;
    }
    button.compact > span {
        flex: initial;
    }

    button:disabled {
        background-color: var(--theme_color_4);
        color: var(--theme_color_6);
    }
</style>
