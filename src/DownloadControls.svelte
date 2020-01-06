<script>
  import Config from "./Config.js";
  import Input from "./Input.svelte";

  export let saveMode = "local";
</script>

<style>

</style>

<!--TODO: split this out into one universal motif-play-control section (play, loop, voice)-->
<!--TODO: and one universal motif crud section (local save, )-->
<!--TODO: this section defines what you can do with a newly-created motif (note-grid, randomize, upload)-->
<!--TODO: convert this to a <fieldset> so I can disable them all at once-->
<div class="motif-controls">
  <button class="wav">
    <span>&#8681;</span>
    <span>WAV</span>
  </button>
  <button class="midi">
    <span>&#8681;</span>
    <span>MIDI</span>
  </button>
  <button class="json">
    <span>&#8681;</span>
    <span>JSON</span>
  </button>
</div>
