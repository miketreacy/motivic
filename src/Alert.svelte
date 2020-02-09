<script>
  import { createEventDispatcher } from "svelte";
  import { fade, fly } from "svelte/transition";
  export let visible = false;
  export let message = "";
  export let type = "";
  export let displayTimeMs = 3000;
  export let dismissable = false;
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

  const dispatch = createEventDispatcher();
</script>

<style>
  section {
    position: fixed;
    top: calc(var(--header_offset) + var(--nav_offset));
    z-index: var(--front);
    background-color: rgba(255, 255, 255, 1);
    width: 95vw;
  }

  .wrap {
    margin-top: 10px;
    border: 1px dashed var(--theme_color_1);
    flex-direction: row;
    position: relative;
    width: 100%;
    max-width: var(--max_main_width);
    min-height: 40px;
    display: block;
    box-sizing: border-box;
    padding: 5px 50px 5px 5px;
  }

  .wrap[data-dismissable="false"] {
    padding-right: 5px;
  }
  [data-type="error"] {
    border: 1px dashed var(--theme_color_8);
  }
  [data-type="error"] .message-type {
    color: var(--theme_color_8);
  }
  [data-type="success"] {
    border: 1px dashed var(--theme_color_7);
  }
  [data-type="success"] .message-type {
    color: var(--theme_color_7);
  }
  [data-type="info"] {
    border: 1px dashed var(--theme_color_1);
  }
  [data-type="info"] .message-type {
    color: var(--theme_color_1);
  }
  [data-type="warn"] {
    border: 1px dashed var(--theme_color_9);
  }
  [data-type="warn"] .message-type {
    color: var(--theme_color_9);
  }
  .message-type {
    font-size: var(--theme_font_size_3);
  }
  .message {
    font-style: italic;
    font-size: var(--theme_font_size_1);
  }
  .dismiss {
    width: 40px;
    position: absolute;
    right: 5px;
    top: 5px;
  }
</style>

<section id="alert">
  {#if visible}
    <div
      class="wrap"
      data-type={type}
      data-dismissable={dismissable}
      in:fly={{ y: -50, duration: 500 }}
      out:fade
      on:introend={onIntroEnd}
      on:outroend={onOutroEnd}>
      <div class="message-type">{type.toUpperCase()}</div>
      <div class="message">{message}</div>
      {#if dismissable}
        <button class="dismiss" on:click={dismiss}>x</button>
      {/if}
    </div>
  {/if}

</section>
