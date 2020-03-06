<script>
  import { createEventDispatcher } from "svelte";
  import { onMount, onDestroy } from "svelte";
  import Config from "./Config.js";
  import Utils from "./Utils.js";
  import {
    newAudioContext,
    playMelody,
    loopMelody,
    stopLoop
  } from "./Audio.js";
  export let selectedVoice = "sine";
  export let selectedMotifs = [];
  export let displayIcons = true;
  export let displayCompact = false;
  let isPlaying = false;
  let isLooping = false;
  let disabled = true;
  let AudioSession = { ctx: null, isPlaying: false, timeoutIDs: [] };
  const timelineStart = 0;
  const waveFormIcon = {
    sawtooth: "&#8961",
    sine: "&#8767;",
    square: "&#9633;",
    triangle: "&#9651;"
  };
  const waveFormNameDisplay = {
    sawtooth: "  sawtooth",
    sine: "     sine;",
    square: "   square",
    triangle: " triangle"
  };
  const dispatch = createEventDispatcher();

  function getVoiceOptionDisplay(voice, shortName, isCompact = false) {
    let padTotal = isCompact ? 5 : 10;
    let str = isCompact ? shortName : voice;
    return Utils.general.leftPad(str, padTotal);
  }

  function stopMotifLoop() {
    isPlaying = false;
    isLooping = false;
    AudioSession.isPlaying = false;
    stopLoop(AudioSession);
  }

  function playMotifs(motifs) {
    isPlaying = true;
    motifs.forEach(motif =>
      playMelody(
        AudioSession,
        motif,
        timelineStart,
        selectedVoice,
        () => (isPlaying = false)
      )
    );
  }

  function playClickHandler(e) {
    if (AudioSession.isPlaying) {
      return false;
    }
    if (selectedMotifs.length) {
      playMotifs(selectedMotifs);
    }
  }

  function loopMotifs(motifs) {
    isPlaying = true;
    isLooping = true;
    motifs.forEach(motif =>
      loopMelody(AudioSession, motif, timelineStart, selectedVoice)
    );
  }

  function loopClickHandler(e) {
    if (AudioSession.isPlaying) {
      stopMotifLoop();
    } else {
      if (selectedMotifs.length) {
        loopMotifs(selectedMotifs);
      }
    }
  }

  onMount(() => {
    AudioSession.ctx = newAudioContext();
  });

  onDestroy(async () => {
    await AudioSession.ctx.close();
    // delete Audio.context to prevent memory leak
    delete AudioSession.ctx;
  });

  $: disabled = !AudioSession.ctx || !selectedMotifs.length;
</script>

<style>
  select {
    width: 50%;
    white-space: normal;
    min-width: 58.2px;
    padding-top: 10px;
  }
  select.compact {
    padding: 12px 7px 7px 7px;
  }
  .playing {
    color: var(--theme_color_9);
  }

  button > span {
    flex: 1 1 0;
  }

  button.compact > span {
    flex: initial;
  }
</style>

<!-- Don't display AudioControls if playback is impossible -->
{#if AudioSession.ctx}
  <select
    bind:value={selectedVoice}
    class:compact={!displayIcons}
    {disabled}
    data-char-length={selectedVoice ? selectedVoice.length : 0}>
    {#each Config.audio.voices as [voice, shortName]}
      <option value={voice}>
        <span>{getVoiceOptionDisplay(voice, shortName, displayCompact)}</span>
        {#if displayIcons}
          <span>
            {@html waveFormIcon[voice]}
          </span>
        {/if}
      </option>
    {/each}
  </select>
  <button
    class="play"
    class:compact={!displayIcons}
    class:playing={isPlaying}
    {disabled}
    on:click={playClickHandler}>
    {#if displayIcons}
      <span>&#9658;</span>
    {/if}
    <span>play</span>
  </button>
  <button
    class="loop"
    class:compact={!displayIcons}
    class:playing={isLooping}
    {disabled}
    on:click={loopClickHandler}>
    {#if displayIcons}
      <span>&infin;</span>
    {/if}
    <span>loop</span>
  </button>
{/if}
