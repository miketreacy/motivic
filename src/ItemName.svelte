<script>
  import { createEventDispatcher } from "svelte";
  import Utils from "./Utils.js";
  export let item = null;
  export let itemType = "";
  export let saveEnabled = true;
  export let itemClickCallback = Function.prototype;
  let displayRenameForm = false;
  let renameFormValue = item.name || "";
  const dispatch = createEventDispatcher();

  function timeoutRenameForm() {
    // TODO: close form n seconds after the last change event fired on the input
    // displayRenameForm = false;
  }

  function toggleRenameForm() {
    displayRenameForm = !displayRenameForm;
    if (displayRenameForm) {
      setTimeout(timeoutRenameForm, 10000);
    }
  }

  function renameMotif() {
    item.name = renameFormValue;
    renameFormValue = "";
    let [success, msg] = Utils.userData.persist(item, itemType, true);
    toggleRenameForm();
  }

  function dispatchDisplayModal(event) {
    dispatch("displayCrudModal", {
      modalProps: {
        show: true,
        itemType: "motifs",
        item: item,
        formType: "rename",
        actionComplete: false
      }
    });
  }
</script>

<style>
  .name-wrap {
    width: 100%;
    position: relative;
    justify-content: left;
  }
  .name {
    cursor: text;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--theme_font_size_2);
    text-align: left;
    flex: 1 1 0;
  }
  .rename {
    padding: 10px;
    background-color: var(--theme_color_10);
    position: absolute;
    top: -10px;
    margin: 0;
    width: 100%;
    flex-direction: column;
    border: none;
    z-index: var(--front);
  }

  button {
    max-width: 40%;
    font-size: var(--theme_font_size_1);
  }

  input {
    width: auto;
    font-size: var(--theme_font_size_2);
    text-align: center;
  }

  .rename-controls {
    flex-direction: row;
    padding-top: 5px;
    justify-content: space-between;
  }
  .toggle {
    width: 40px;
    height: 30px;
    justify-self: center;
  }
</style>

<div class="name-wrap">
  <h3 class="name" on:click|self|stopPropagation={itemClickCallback}>
    {item.name}
  </h3>
  <button class="toggle" on:click|self={dispatchDisplayModal}>&#9998;</button>
  <fieldset class="rename" class:hide={!displayRenameForm}>
    <input
      type="text"
      bind:value={renameFormValue}
      placeholder={`rename ${Utils.general.singularize(itemType)}`} />
    <div class="rename-controls">
      <button
        class="rename-cancel"
        on:click|self|stopPropagation={toggleRenameForm}>
        cancel
      </button>
      {#if saveEnabled}
        <button
          class="rename-submit"
          on:click|self|stopPropagation={renameMotif}>
          save
        </button>
      {/if}
    </div>
  </fieldset>
</div>
