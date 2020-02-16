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
  let renameItemValue = item.name || "";

  function saveItem() {
    item.name = renameItemValue;
    let [success, msg] = Utils.userData.persist(item, itemType, true);
    responseMsg = msg;
    actionComplete = true;
    timeoutId = window.setTimeout(submitCallback, 2000);
  }

  function deleteItem() {
    let [success, msg] = Utils.userData.remove(item, itemType);
    // TODO: update child variations to remove child.parent => id reference
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
    width: 100%;
  }
  .input-wrap {
    flex-direction: column;
    padding: 10px;
    align-content: center;
    line-height: 30px;
  }
  .msg {
    padding: 10px 0;
  }

  label,
  input,
  p {
    flex: 1 1 0;
    text-align: center;
    line-height: 30px;
    min-height: auto;
    width: 100%;
    /* max-width: fit-content; */
  }
  .form-wrap {
    padding-top: 10px;
  }
  .submit {
    background-color: var(--theme_color_1);
    margin: 10px auto 0;
  }
  div[data-form-type="delete"] .submit {
    background-color: var(--theme_color_8);
  }
  .item {
    border: 2px solid var(--theme_color_6);
    padding: 5px;
  }

  #item-name {
    font-size: var(--theme_font_size_2);
  }

  .item-confirmation {
    align-items: flex-start;
  }
  .item-confirmation li {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-items: flex-start;
  }
  .item-confirmation li span {
    display: block;
    box-sizing: border-box;
  }
  .key {
    font-style: italic;
    padding-right: 5px;
  }
  .value {
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    max-width: 70vw;
  }
</style>

{#if formType === 'save'}
  <div class="form-wrap">
    <h3>Save {Utils.general.singularize(itemType)}</h3>
    <fieldset>
      <div class="input-wrap name">
        <label for="item-name">name</label>
        <input
          type="text"
          max="32"
          class="name"
          id="item-name"
          bind:value={renameItemValue}
          placeholder={`${Utils.general.singularize(itemType)} name`} />
      </div>
      <button class="submit" disabled={actionComplete} on:click={saveItem}>
        submit
      </button>
    </fieldset>
    {#if actionComplete}{responseMsg}{/if}
  </div>
{/if}
{#if formType === 'rename'}
  <div class="form-wrap">
    <h3>Rename {Utils.general.singularize(itemType)}</h3>
    <fieldset>
      <div class="input-wrap name">
        <label for="item-name">name</label>
        <input
          type="text"
          max="32"
          class="name"
          id="item-name"
          bind:value={renameItemValue}
          placeholder={`rename ${Utils.general.singularize(itemType)}`} />
      </div>
      <button class="submit" disabled={actionComplete} on:click={saveItem}>
        submit
      </button>
    </fieldset>
    {#if actionComplete}{responseMsg}{/if}
  </div>
{/if}
{#if formType === 'delete'}
  <div class="form-wrap" data-form-type={formType}>
    <h3>Delete {Utils.general.singularize(itemType)}</h3>
    <fieldset>
      <div class="input-wrap msg">
        <p class="confirmation">
          {`Do you really want to delete this ${Utils.general.singularize(itemType)}?`}
        </p>
        <div class="item">
          <ul class="item-confirmation">
            <li>
              <span class="key">name:</span>
              <span class="value">{item.name}</span>
            </li>
            <li>
              <span class="key">id:</span>
              <span class="value">{item.id}</span>
            </li>
            <li>
              <span class="key">created:</span>
              <span class="value">{item.created}</span>
            </li>
          </ul>
        </div>
      </div>
      <button class="submit" disabled={actionComplete} on:click={deleteItem}>
        delete
      </button>
    </fieldset>
    {#if actionComplete}{responseMsg}{/if}
  </div>
{/if}
