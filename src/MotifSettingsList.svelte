<script>
  export let settings = [];
  export let title = "";
  let displayList = false;

  function toggleDisplay() {
    displayList = !displayList;
  }
</script>

<style>
  .wrap {
    flex-direction: column;
    width: 100%;
  }
  .title {
    align-self: flex-start;
    padding: 10px;
    background-color: var(--theme_color_1);
    color: var(--theme_color_2);
    border-radius: 5px;
  }
  .list {
    width: 100%;
    margin: 0;
    padding: 10px;
    display: flex;
    flex-direction: column;
    background-color: var(--theme_color_4);
    border: 1px solid var(--theme_color_7);
    border-radius: 5px;
  }
  .setting {
    justify-content: space-between;
  }

  .key {
    display: flex;
    margin: 0;
  }

  .value {
    display: flex;
    margin-left: 10px;
    font-family: monospace;
  }
</style>

<div class="wrap">
  {#if title}
    <div class="title" on:click={toggleDisplay}>{title}</div>
  {/if}
  {#if displayList}
    <dl class="list">
      {#each Object.entries(settings) as [name, value]}
        <div class="setting">
          <dt class="key">{name}</dt>
          <dd class="value">{value}</dd>
        </div>
      {/each}
    </dl>
  {/if}
</div>
