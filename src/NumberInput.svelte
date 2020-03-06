<script>
  import { createEventDispatcher } from "svelte";
  export let id = "";
  export let required = true;
  export let min = 0;
  export let max = 0;
  export let step = 1;
  export let value;
  export let form = "";
  export let apiField;
  export let displayClass = "display-block";

  const dispatch = createEventDispatcher();
  /**
   * Keeps text input on number inputs within defined HTML attributes (step, min, max)
   * @param {number} [stepChange] Optional change to input value from another event (in step units).
   * @return {number} Processed input value.
   */
  function getUpdatedValue(stepChange) {
    let val = (value || min) + stepChange * step;
    let newVal = Math.min(Math.max(min, val), max);

    return Math.max(newVal - (newVal % step), step);
  }

  function numChange(e) {
    let targEl = e.target;
    let change = targEl.getAttribute("data-num-change");
    let int = parseInt(change, 10);
    value = getUpdatedValue(int);
  }

  function dispatchValueChange(val) {
    if (apiField) {
      dispatch("inputValueChange", { value: val, field: id, form });
    }
  }

  $: {
    dispatchValueChange(value);
  }
</script>

<style>
  ._number-input {
    border: none;
    position: relative;
  }

  .qty-controls {
    display: flex;
    flex: 1 1 0;
    flex-direction: row;
    padding: 0;
    justify-content: space-between;
    box-sizing: content-box;
  }

  input {
    box-sizing: border-box;
    padding: 0;
    flex: 1 1 0;
    min-width: 0;
    max-width: var(--touch_min_width);
    text-align: center;
    border: none;
  }
  button {
    color: var(--theme_color_1);
    background-color: var(--theme_color_2);
    position: static;
    max-width: var(--touch_min_width);
    flex: 1 1 0;
    cursor: pointer;
    border: none;
  }
</style>

<div class="qty-controls">
  <button
    class="fa fa-minus num-change"
    data-num-change="-1"
    name="qty"
    on:click|self={numChange}>
    &minus;
  </button>
  <input
    type="number"
    {id}
    class={displayClass}
    bind:value
    {required}
    {min}
    {max}
    {step}
    inputmode="numeric"
    pattern="[0-9]*" />
  <button
    class="fa fa-plus num-change"
    data-num-change="1"
    name="qty"
    on:click|self={numChange}>
    &plus;
  </button>
</div>
