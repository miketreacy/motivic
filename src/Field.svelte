<script>
  export let type = "";
  export let id = "";
  export let dataKey = "";
  export let dataIndex = 0;
  export let label = "";
  export let defaultValue = "";
  export let required = true;
  export let options = [];
  export let min = 0;
  export let max = 9;
  export let step = 1;
</script>

<style>
  input {
    cursor: pointer;
    color: var(--theme_color_2);
    font-size: var(--theme_font_size_2);
    background-color: var(--theme_color_1);
    border: none;
    border-radius: 5px;
    min-height: 30px;
    outline: none;
  }

  input:focus {
    outline: none;
  }

  .input-wrap {
    flex-direction: row;
    padding: 0;
    width: 100%;
    position: relative;
    height: 40px;
    justify-content: space-between;
  }

  .input-wrap label {
    padding: 5px;
  }

  .input-wrap input {
    padding: 5px;
    height: 30px;
    border: 1px solid var(--theme_color_10);
    width: 40%;
    margin: 0;
  }
  .input-wrap input[type="checkbox"] {
    width: 40px;
  }

  input[type="file"] {
    width: auto;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .input-wrap.overlay {
    position: absolute;
    left: 170px;
    width: 80px;
  }

  .input-wrap.name {
    flex-direction: column;
  }

  .input-wrap.name input {
    width: auto;
    text-align: center;
  }

  .input {
    flex: 1 1 0;
  }

  .input label {
    flex: 100% 1 0;
  }

  .input select,
  .input input,
  .input label {
    font-size: var(--theme_font_size_1);
  }
</style>

<div class="input-wrap">
  <label for={id}>{label}</label>
  {#if type == 'dropdown'}
    <select
      {id}
      data-key={dataKey}
      data-default={defaultValue}
      data-index={dataIndex}
      value={defaultValue}
      {required}>
      {#each options as opt}
        <option>opt.label</option>
      {/each}
    </select>
  {:else if type == 'number'}
    <input
      {type}
      {id}
      data-key={dataKey}
      data-default={defaultValue}
      value={defaultValue}
      {required}
      {min}
      {max}
      {step}
      inputmode="numeric"
      pattern="[0-9]*" />
  {:else if type == 'text'}
    <input
      {type}
      {id}
      data-key={dataKey}
      data-default={defaultValue}
      value={defaultValue}
      placeholder={defaultValue}
      {max}
      {required} />
  {:else if type == 'checkbox'}
    <input
      {type}
      {id}
      data-key={dataKey}
      data-default={defaultValue}
      data-index={dataIndex}
      value={defaultValue}
      {required} />
  {:else if type == 'hidden'}
    <input
      {type}
      {id}
      data-key={dataKey}
      data-default={defaultValue}
      data-index={dataIndex}
      value={defaultValue} />
  {/if}
</div>
