<script>
    export let formId = ''
    export let formTitle = ''
    export let formInfo = ''
    export let formOpen = false
    let showInfo = false
    let iconMap = {
        uploader: ['&#8679;'],
        randomizer: ['&#9861;'],
        transformer: ['&#10226;']
    }
</script>

<style>
    div {
        flex-direction: row;
    }
    h2 {
        font-size: var(--theme_font_size_4);
        flex: 1 0 0;
    }
    h2[data-closed='true'] {
        font-size: var(--theme_font_size_2b);
        text-transform: lowercase;
    }

    h2:hover {
        position: relative;
    }

    /* TODO: future CSS tooltop implementation below */
    /* h2:hover:after {
    content: attr(title);
    padding: 4px 8px;
    color: #333;
    position: absolute;
    left: 0;
    top: 100%;
    white-space: nowrap;
    z-index: 20px;
    border-radius: 5px;
    box-shadow: 0px 0px 4px #222;
    background-image: linear-gradient(top, #eeeeee, #cccccc);
  } */

    .icons {
        font-size: var(--theme_font_size_4);
        margin: 0 10px;
        /* hiding icons for now - form header too cluttered */
        display: none;
    }
</style>

<div>
    {#if formOpen}
        <span class="icons">
            {@html iconMap[formId]}
        </span>
    {/if}
    <h2 data-closed={!formOpen} title={formInfo}>
        <!-- {#if formOpen}
    <span class="icons">
      {@html iconMap[formId]}
    </span>
  {/if} -->
        {formTitle}
        <!-- {#if formOpen}
    <span class="icons">
      {@html iconMap[formId]}
    </span>
  {/if} -->
    </h2>
    {#if formOpen}
        <span class="icons">
            {@html iconMap[formId]}
        </span>
    {/if}
    {#if formOpen && showInfo}
        <p class="info">{formInfo}</p>
    {/if}
</div>
