<script>
  import Config from "./Config.js";
  import Input from "./Input.svelte";
  const waveFormIcon = {
    saw: "&#8961",
    sine: "&#8767;",
    square: "&#9633;",
    triangle: "&#9651;"
  };
</script>

<style>
  select {
    width: 50%;
    white-space: normal;
  }
</style>

<!--TODO: split this out into one universal motif-play-control section (play, loop, voice)-->
<!--TODO: and one universal motif crud section (local save, )-->
<!--TODO: this section defines what you can do with a newly-created motif (note-grid, randomize, upload)-->
<!--TODO: convert this to a <fieldset> so I can disable them all at once-->
<div class="motif-controls">
  <select>
    {#each Config.voices.map(v => (v === 'sawtooth' ? 'saw' : v)) as voice}
      <option value={voice}>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;voice&nbsp;&#13;&#10;&nbsp;
        {@html waveFormIcon[voice]}
        {voice}
      </option>
    {/each}
  </select>
  <button class="play">
    <span>&#9658;</span>
    <span>play</span>
  </button>
  <button class="loop">
    <span>&infin;</span>
    <span>loop</span>
  </button>
</div>
