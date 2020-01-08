<script>
  import { createEventDispatcher } from "svelte";
  export let state = "show";
  const dispatch = createEventDispatcher();
  function dispatchDismissModal() {
    dispatch("displayModal", {
      display: false
    });
  }
</script>

<style>
  #modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: var(--front);
    background-color: rgba(0, 0, 0, 0);
    transition-property: background-color;
    transition-duration: var(--timing_slow);
    transition-timing-function: linear;
    transition-delay: var(--timing_fast);
    opacity: 0.85;
  }
  #modal.show {
    background-color: rgba(0, 0, 0, 0.95);
  }
  .alert {
    margin: 0 auto;
    box-sizing: border-box;
    text-align: center;
    width: 40vw;
    z-index: var(--front);
    background-color: var(--theme_color_2);
    border: 1px solid var(--theme_color_2);
    cursor: default;
    transition-property: background-color;
    transition-duration: var(--timing_slow);
    transition-timing-function: linear;
    transition-delay: var(--timing_fast);
    max-width: 400px;
    min-width: 300px;
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>

<div id="modal" class={state}>
  <div class="alert">
    <button class="dismiss" on:click={dispatchDismissModal}>x</button>
    <slot />
  </div>
</div>
