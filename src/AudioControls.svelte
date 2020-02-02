<script>
  import Config from "./Config.js";
  import {
    getPlayState,
    setPlayState,
    startAudioContext,
    playMelody,
    loopMelody,
    stopLoop
  } from "./Audio.js";
  export let selectedVoice = "sine";
  export let selectedMotifs = [];
  export let isPlaying = false;
  export let isLooping = false;
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
    startAudioContext();
    motifs.forEach(m =>
      playMelody(m, 0, selectedVoice, () => (isPlaying = false))
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
    startAudioContext();
    motifs.forEach(m => loopMelody(m, 0, selectedVoice, false));
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
  }
  .playing {
    color: var(--theme_color_9);
  }
</style>

<div class="motif-controls">
  <select bind:value={selectedVoice} {disabled}>
    {#each Config.voices as voice}
      <option value={voice}>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;voice&nbsp;&#13;&#10;&nbsp;
        {@html waveFormIcon[voice]}
        {voice === 'sawtooth' ? 'saw' : voice}
      </option>
    {/each}
  </select>
  <button
    class="play"
    class:playing={isPlaying}
    {disabled}
    on:click={playClickHandler}>
    <span>&#9658;</span>
    <span>play</span>
  </button>
  <button
    class="loop"
    class:playing={isLooping}
    {disabled}
    on:click={loopClickHandler}>
    <span>&infin;</span>
    <span>loop</span>
  </button>
</div>
