<script>
  import { createEventDispatcher } from "svelte";
  import Input from "./Input.svelte";
  export let type = "";
  export let saveMode = "local";
  export let selectedItems = [];

  const dispatch = createEventDispatcher();
  function dispatchDisplayModal(event) {
    dispatch("displayCrudModal", {
      modalProps: {
        show: true,
        itemType: type,
        item: selectedItems[0],
        formType: event.target.dataset.action,
        actionComplete: false
      }
    });
  }
</script>

<style>
  span {
    pointer-events: none;
  }
</style>

<div class="motif-controls">
  <button
    id="save-motif"
    class="save"
    data-action="save"
    data-save-mode={saveMode}
    disabled={selectedItems.length !== 1}
    on:click|self={dispatchDisplayModal}>
    <span>
      {#if saveMode === 'cloud'}&#9729;{:else}&#9745;{/if}
    </span>
    <span>save</span>
  </button>
  <button
    id="delete-motif"
    class="delete"
    data-action="delete"
    disabled={selectedItems.length !== 1}
    on:click|self={dispatchDisplayModal}>
    <span>&#9747;</span>
    <span>delete</span>
  </button>
</div>
