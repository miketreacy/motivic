<script>
  import Field from "./Field.svelte";
  export let formId;
  export let formTitle;
  export let formInfo;
  export let submitFunction;
  export let formState = {};
  export let fieldRows = [];
</script>

<style>
  fieldset {
    border-style: solid;
    padding: 0;
    margin: 0;
    width: 100%;
    flex-direction: column;
  }

  fieldset > div {
    padding: 5px 10px;
    flex-direction: column;
    border-bottom: 1px dotted var(--theme_color_10);
    width: 100%;
  }

  fieldset > div:last-of-type {
    border-bottom: none;
  }

  fieldset label,
  fieldset input {
    padding: 0 5px;
  }
</style>

<!--TODO: make this the abstract component class that is used by RandomizerForm and TransformerForm -->
<section id={formId} class="show closed form">
  <h2>
    <span class="icons dice">&#9861;</span>
    {formTitle}
    <span class="icons dice">&#9861;</span>
  </h2>
  <p class="info">{formInfo}</p>
  <fieldset class="user-input">
    <legend>Settings</legend>
    <!--<button class="save-setting">save setting</button>-->
    {#each fieldRows as fields}
      <div class="form-row">
        {#each fields as field}
          <Field {...field} />
        {/each}
      </div>
    {/each}
  </fieldset>
  <details data-section={formId}>
    <summary>
      <h2>
        <span class="icons dice">&#9861;</span>
        {formTitle}
        <span class="icons dice">&#9861;</span>
      </h2>
      <p class="info">{formInfo}</p>
    </summary>
    <!--<section class="show selected-setting">
                <div class="input-wrap">
                    <label for="select-setting">Selected Setting</label>
                    <button id="select-setting-reset">clear</button>
                    <select id="select-setting" name="selected-setting" data-default="new unnamed" data-action="single"></select>
                </div>
            </section>-->
    <fieldset class="user-input">
      <legend>Settings</legend>
      <!--<button class="save-setting">save setting</button>-->
      {#each fieldRows as fields}
        <div class="form-row">
          {#each fields as field}
            <Field {...field} />
          {/each}
        </div>
      {/each}
    </fieldset>
  </details>
  <div class="form-controls">
    <button class="section-toggle" data-section={formId}>open</button>
    <button class="reset" data-section={formId} disabled>reset</button>
    <button
      class="apply"
      id={formId}
      data-section={formId}
      on:click={submitFunction}>
      <span>apply</span>
    </button>
  </div>
</section>
