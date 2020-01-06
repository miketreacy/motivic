<script>
  import Input from "./Input.svelte";
  export let saveMode = "local";
  export let selectedMotifs = [];
</script>

<style>

</style>

<div class="motif-controls">
  <button
    class="save"
    data-save-mode={saveMode}
    disabled={selectedMotifs.length !== 1}>
    <span>
      {#if saveMode === 'cloud'}&#9729;{:else}&#9745;{/if}
    </span>
    <span>save</span>
  </button>
  <button class="delete" disabled={!selectedMotifs.length}>
    <span>&#9747;</span>
    <span>delete</span>
  </button>
</div>
