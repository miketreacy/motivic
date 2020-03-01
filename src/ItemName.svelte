<script>
  import { createEventDispatcher } from "svelte";
  import Utils from "./Utils.js";
  export let item = null;
  export let itemType = "";
  const dispatch = createEventDispatcher();

  function dispatchDisplayModal(event) {
    dispatch("displayCrudModal", {
      modalProps: {
        show: true,
        itemType,
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

  button {
    max-width: 40%;
    font-size: var(--theme_font_size_1);
  }

  .rename {
    width: 40px;
    height: 30px;
    justify-self: center;
  }
</style>

<div class="name-wrap" on:click>
  <h3 class="name" data-item-id={item.id} on:click>{item.name}</h3>
  <button class="rename" on:click|self={dispatchDisplayModal}>&#9998;</button>
</div>
