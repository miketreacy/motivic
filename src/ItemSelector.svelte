<script>
  import { createEventDispatcher } from "svelte";
  import Utils from "./Utils";
  export let itemSelected = false;
  export let items = [];
  export let itemType = "";
  export let selectedItemId = "";
  export let formId = "";

  const dispatch = createEventDispatcher();
  $: console.log(`selected item id = ${selectedItemId}`);
  $: dispatchItemSelection(selectedItemId);

  function dispatchItemSelection(itemId) {
    dispatch("itemSelection", { itemId, itemType, formId });
  }
</script>

<style>
  .input-wrap {
    flex-direction: column;
    width: 100%;
    padding: 10px;
  }
</style>

<section>
  <div class="input-wrap">
    <label for="select-item">
      selected {Utils.general.singularize(itemType)}:
    </label>
    <select id="select-item" name="selected-motif" bind:value={selectedItemId}>
      {#each items as item}
        <option value={item.id}>{item.name}</option>
      {/each}
    </select>
    {#if itemSelected}
      <button id="select-motif-reset">clear</button>
    {/if}
  </div>
</section>
