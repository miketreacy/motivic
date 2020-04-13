<script>
  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";
  export let visible = false;
  export let message = "";
  export let type = "";
  export let displayTimeMs = 3000;
  export let dismissable = false;
  export let top = 0;
  export let displayLabel = true;
  let typeColor = "";
  // types:
  //       SUCCESS
  //       ERROR
  //       WARN
  //       INFO
  function dismiss() {
    visible = false;
  }

  function onIntroEnd() {
    if (!dismissable) {
      setTimeout(dismiss, displayTimeMs);
    }
  }

  function onOutroEnd() {
    dispatch("displayAlert", { visble: false });
  }

  function getTypeColor(type) {
    return {
      warn: "var(--theme_color_9)",
      success: "var(--theme_color_7)",
      info: "var(--theme_color_1)",
      error: "var(--theme_color_8)"
    }[type];
  }

  const dispatch = createEventDispatcher();

  $: typeColor = getTypeColor(type);
</script>

<style>
  section {
    position: fixed;
    top: var(--top);
    z-index: var(--front);
    background-color: rgba(255, 255, 255, 0.75);
    width: 95vw;
  }

  .wrap {
    background-color: rgba(255, 255, 255, 1);
    margin: 10px 0 0 0;
    flex-direction: row;
    position: relative;
    width: 100%;
    max-width: var(--max_main_width);
    min-height: var(--touch_min_height);
    display: block;
    box-sizing: border-box;
    padding: 5px 50px 5px 5px;
    border: 2px solid var(--color);
  }

  .wrap[data-dismissable="false"] {
    padding-right: 5px;
  }

  .message-type {
    color: var(--theme_color_3);
    font-size: var(--theme_font_size_3);
  }
  .message {
    font-style: italic;
    font-size: var(--theme_font_size_1);
    white-space: pre-wrap;
  }
  .dismiss {
    width: var(--touch_min_width);
    position: absolute;
    right: 5px;
    top: 5px;
  }
</style>

<section id="alert" style="--color: {typeColor}; --top: {top}px">
  {#if visible}
    <div
      class="wrap"
      data-type={type}
      data-dismissable={dismissable}
      in:fly={{ y: -50, duration: 500 }}
      out:fade
      on:introend={onIntroEnd}
      on:outroend={onOutroEnd}>
      {#if displayLabel}
        <div class="message-type">{type.toUpperCase()}</div>
      {/if}
      <div class="message">{message}</div>
      {#if dismissable}
        <button class="dismiss" on:click={dismiss}>x</button>
      {/if}
    </div>
  {/if}

</section>
