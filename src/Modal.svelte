<script>
  import { createEventDispatcher } from "svelte";
  export let show = false;
  export let item = null;
  export let type = "";
  export let submitCallback = Function.prototype;
  let modal;
  let actionComplete = false;
  const dispatch = createEventDispatcher();
  let modalProps = {
    itemType: "",
    item: null,
    formType: "",
    show: false,
    actionComplete: false
  };
  function dispatchDismissModal() {
    dispatch("displayCrudModal", {
      modalProps
    });
  }
</script>

<style>
  .modal-background {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: var(--obscured);
    background-color: rgba(0, 0, 0, 0);
    transition-property: background-color;
    transition-duration: var(--timing_fastest);
    transition-timing-function: linear;
    transition-delay: var(--timing_now);
  }
  .modal-background.show {
    background-color: rgba(0, 0, 0, 0.85);
    z-index: var(--front);
  }

  .alert {
    display: flex;
    visibility: hidden;
    margin: 0 auto;
    padding: 10px;
    box-sizing: border-box;
    text-align: center;
    width: 90vw;
    z-index: var(--front);
    background-color: var(--theme_color_2);
    border: 1px solid var(--theme_color_2);
    cursor: default;
    transition-property: visibility;
    transition-duration: var(--timing_fast);
    transition-timing-function: linear;
    transition-delay: var(--timing_fastest);
    max-width: 400px;
    min-width: 300px;
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .modal-background.show .alert {
    visibility: visible;
  }
  .dismiss {
    cursor: pointer;
    padding: 0px;
    background-color: var(--theme_color_10);
    color: white;
    position: absolute;
    width: 40px;
    height: 30px;
    top: 10px;
    right: 10px;
  }
</style>

<div class="modal-background" class:show bind:this={modal}>
  <div class="alert" bind:this={modal}>
    <button class="dismiss" on:click={dispatchDismissModal}>x</button>
    <slot />
  </div>
</div>
