<script>
  import { createEventDispatcher } from "svelte";
  import Input from "./Input.svelte";
  export let type = "";
  export let saveMode = "local";
  export let selectedItems = [];
  export let displayIcons = true;

  const dispatch = createEventDispatcher();
  function dispatchDisplayModal(event) {
    console.info(`dispatchDisplayModal() called`);
    let payload = {
      modalProps: {
        show: true,
        itemType: type,
        item: selectedItems[0],
        formType: event.target.dataset.action,
        actionComplete: false
      }
    };
    console.dir(payload);
    dispatch("displayCrudModal", payload);
  }
</script>

<style>
  span {
    pointer-events: none;
  }
</style>

<button
  id="save-motif"
  class="save"
  data-action="save"
  data-save-mode={saveMode}
  disabled={selectedItems.length !== 1}
  on:click|self={dispatchDisplayModal}>
  {#if displayIcons}
    <span>
      {#if saveMode === 'cloud'}&#9729;{:else}&#9745;{/if}
    </span>
  {/if}
  <span>save</span>
</button>
<button
  id="delete-motif"
  class="delete"
  data-action="delete"
  disabled={selectedItems.length !== 1}
  on:click|self={dispatchDisplayModal}>
  {#if displayIcons}
    <span>&#9747;</span>
  {/if}
  <span>delete</span>
</button>
