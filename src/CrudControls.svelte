<script>
  import { createEventDispatcher } from "svelte";
  import Input from "./Input.svelte";
  import ItemDeleteForm from "./ItemDeleteForm.svelte";
  import ItemSaveForm from "./ItemSaveForm.svelte";
  export let type = "";
  export let saveMode = "local";
  export let selectedMotifs = [];
  const modalMap = {
    "save-motif": ItemSaveForm,
    "delete-motif": ItemDeleteForm
  };
  const dispatch = createEventDispatcher();
  function dispatchDisplayModal(event) {
    dispatch("displayModal", {
      display: true,
      view: modalMap[event.target.id],
      item: selectedMotifs[0],
      type: type
    });
  }
</script>

<style>

</style>

<div class="motif-controls">
  <button
    id="save-motif"
    class="save"
    data-save-mode={saveMode}
    disabled={selectedMotifs.length !== 1}
    on:click={dispatchDisplayModal}>
    <span>
      {#if saveMode === 'cloud'}&#9729;{:else}&#9745;{/if}
    </span>
    <span>save</span>
  </button>
  <button
    id="delete-motif"
    class="delete"
    disabled={!selectedMotifs.length}
    on:click={dispatchDisplayModal}>
    <span>&#9747;</span>
    <span>delete</span>
  </button>
</div>
