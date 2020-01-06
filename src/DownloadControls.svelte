<script>
  import Config from "./Config.js";
  import Input from "./Input.svelte";

  export let saveMode = "local";
  export let selectedMotifs = [];
  let disabled = true;

  $: {
    disabled = selectedMotifs.length !== 1;
  }
</script>

<style>

</style>

<div class="motif-controls">
  <button class="wav" {disabled}>
    <span>&#8681;</span>
    <span>WAV</span>
  </button>
  <button class="midi" {disabled}>
    <span>&#8681;</span>
    <span>MIDI</span>
  </button>
  <button class="json" {disabled}>
    <span>&#8681;</span>
    <span>JSON</span>
  </button>
</div>
