<script>
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
  <button class="save" data-save-mode={saveMode}>
    <span>
      {#if saveMode === 'cloud'}&#9729;{:else}&#9745;{/if}
    </span>
    <span>save</span>
  </button>
  <button class="delete">
    <span>&#9747;</span>
    <span>delete</span>
  </button>
</div>
