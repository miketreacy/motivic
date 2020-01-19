<script>
  import { onMount } from "svelte";
  import Utils from "./Utils";
  export let item = null;
  export let itemType = "";
  export let submitCallback = Function.prototype;
  export let actionComplete = false;
  export let formType = "";
  let timeoutId = "";
  let responseMsg = "";

  function saveItem() {
    let [success, msg] = Utils.userData.persist(item, itemType, true);
    responseMsg = msg;
    actionComplete = true;
    timeoutId = window.setTimeout(submitCallback, 2000);
  }

  function deleteItem() {
    let [success, msg] = Utils.userData.remove(item, itemType);
    // TODO: update child variations to remove child.parent => id reference and child.role == variation
    responseMsg = msg;
    actionComplete = true;
    timeoutId = window.setTimeout(submitCallback, 2000);
  }
  onMount(() => {
    console.info(`ItemCrudForm onMount() props`);
    console.dir($$props);
  });
</script>

<style>
  fieldset {
    background-color: var(--theme_color_5);
    padding: 10px;
    margin: 10px 0;
  }
  .input-wrap {
    flex-direction: row;
  }

  label,
  input {
    flex: 1 1 0;
    text-align: center;
    height: auto;
    min-height: auto;
  }
  .submit {
    background-color: var(--theme_color_1);
    margin: 10px auto 0;
  }
  .item {
    border: 2px dashed var(--theme_color_6);
    padding: 5px;
  }

  .item span {
    padding-right: 5px;
    font-weight: bold;
  }
  .item-name {
    font-size: var(--theme_font_size_3);
  }
  .item-id {
    font-style: italic;
  }
</style>

{#if formType === 'save'}
  <div id="save-motif-form">
    <h3>Save {Utils.general.singularize(itemType)}</h3>
    <fieldset id="save-motif">
      <div class="input-wrap name">
        <label for="motif_name">name</label>
        <input
          type="text"
          max="16"
          class="name"
          id="motif_name"
          value={item.name}
          placeholder={item.name} />
      </div>
      <button class="submit" disabled={actionComplete} on:click={saveItem}>
        submit
      </button>
    </fieldset>
    {#if actionComplete}{responseMsg}{/if}
  </div>
{/if}
{#if formType === 'delete'}
  <div>
    <h3>Delete {Utils.general.singularize(itemType)}</h3>
    <fieldset id="delete-motif">
      <div class="input-wrap name">
        Do you really want to delete
        <div class="item">
          <span class="item-name">{item.name}</span>
          ID:
          <span class="item-id">{item.id}</span>
          ?
        </div>
      </div>
      <button class="submit" disabled={actionComplete} on:click={deleteItem}>
        delete
      </button>
    </fieldset>
    {#if actionComplete}{responseMsg}{/if}
  </div>
{/if}
