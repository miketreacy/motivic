<script>
  import Config from "./Config.js";
  import {
    getPlayState,
    setPlayState,
    getAudioContext,
    playMelody,
    loopMelody,
    stopLoop
  } from "./Audio.js";
  export let selectedVoice = "sine";
  export let selectedMotifs = [];
  export let isPlaying = false;
  export let isLooping = false;
  export let displayIcons = true;
  export let displayCompact = false;
  let disabled = true;

  const waveFormIcon = {
    sawtooth: "&#8961",
    sine: "&#8767;",
    square: "&#9633;",
    triangle: "&#9651;"
  };

  function stopMotifLoop() {
    isPlaying = false;
    isLooping = false;
    setPlayState(false);
    stopLoop();
  }

  function playMotifs(motifs) {
    isPlaying = true;
    let ctx = getAudioContext();
    if (!ctx) {
      console.error(`Web Audio playback stopped: AudioContext not created`);
      console.dir(ctx);
      return;
    }
    motifs.forEach(m =>
      playMelody(ctx, m, 0, selectedVoice, () => (isPlaying = false))
    );
  }

  function playClickHandler(e) {
    if (getPlayState()) {
      return false;
    }
    if (selectedMotifs.length) {
      playMotifs(selectedMotifs);
    }
  }

  function loopMotifs(motifs) {
    isPlaying = true;
    isLooping = true;
    let ctx = getAudioContext();
    if (!ctx) {
      console.error(`Web Audio playback stopped: AudioContext not created`);
      console.dir(ctx);
      return;
    }
    motifs.forEach(m => loopMelody(ctx, m, 0, selectedVoice, false));
  }

  function loopClickHandler(e) {
    if (getPlayState()) {
      stopMotifLoop();
    } else {
      if (selectedMotifs.length) {
        loopMotifs(selectedMotifs);
      }
    }
  }

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
  {#each Config.voices as [voice, shortName]}
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
