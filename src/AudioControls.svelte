<script>
  import { onMount } from "svelte";
  import Config from "./Config.js";
  import {
    getAudioContext,
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
  let AudioCtx = null;
  let AudioState = { isPlaying: false };
  const timelineStart = 0;
  const waveFormIcon = {
    sawtooth: "&#8961",
    sine: "&#8767;",
    square: "&#9633;",
    triangle: "&#9651;"
  };

  function stopMotifLoop() {
    isPlaying = false;
    isLooping = false;
    AudioState.isPlaying = false;
    stopLoop(AudioState, AudioCtx);
  }

  function playMotifs(motifs) {
    isPlaying = true;
    if (!AudioCtx) {
      console.error(`Web Audio playback stopped: AudioContext not created`);
      console.dir(AudioCtx);
      return;
    }
    motifs.forEach(motif =>
      playMelody(
        AudioState,
        AudioCtx,
        motif,
        timelineStart,
        selectedVoice,
        () => (isPlaying = false)
      )
    );
  }

  function playClickHandler(e) {
    if (AudioState.isPlaying) {
      return false;
    }
    if (selectedMotifs.length) {
      playMotifs(selectedMotifs);
    }
  }

  function loopMotifs(motifs) {
    isPlaying = true;
    isLooping = true;
    if (!AudioCtx) {
      console.error(`Web Audio playback stopped: AudioContext not created`);
      console.dir(AudioCtx);
      return;
    }
    motifs.forEach(motif =>
      loopMelody(AudioState, AudioCtx, motif, timelineStart, selectedVoice)
    );
  }

  function loopClickHandler(e) {
    if (AudioState.isPlaying) {
      stopMotifLoop();
    } else {
      if (selectedMotifs.length) {
        loopMotifs(selectedMotifs);
      }
    }
  }

  function init(settings) {
    console.info(`Initilizalizing Audio Context`);
    AudioCtx = getAudioContext();
    if (!AudioCtx) {
      // TODO: display to user as alert message
      console.error(`No AudioContext available, playback is impossible`);
    }
  }

  onMount(() => {
    init();
  });

  $: {
    disabled = !selectedMotifs.length;
  }
</script>

<style>
  select {
    width: 50%;
    white-space: normal;
    min-width: 58.2px;
    padding-top: 10px;
  }
  .compact {
    padding: 7px;
    padding-top: 12px;
  }
  .playing {
    color: var(--theme_color_9);
  }
</style>

<select
  bind:value={selectedVoice}
  class:compact={!displayIcons}
  {disabled}
  data-char-length={selectedVoice ? selectedVoice.length : 0}>
  {#each Config.audio.voices as [voice, shortName]}
    <option value={voice}>
      <span>{displayCompact ? shortName : voice}</span>
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
  class:playing={isLooping}
  {disabled}
  on:click={loopClickHandler}>
  {#if displayIcons}
    <span>&infin;</span>
  {/if}
  <span>loop</span>
</button>
