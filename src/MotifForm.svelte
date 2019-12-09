<script>
  import { onMount } from "svelte";
  import Field from "./Field.svelte";
  import MotifFormHeader from "./MotifFormHeader.svelte";
  import MotifFormControls from "./MotifFormControls.svelte";
  export let formId;
  export let formTitle;
  export let formInfo;
  export let submitFunction;
  export let formState = {};
  export let fieldRows = [];
  let formStateDefault = {};
  let formOpen = false;
  let formInDefaultState = true;

  function formChange(event) {
    console.log("formChange() called!");
    let fieldId = this.id;
    formState[fieldId] = event.detail.value;
    console.log("FORM STATE CHANGE");
    console.dir(formState);
    console.dir(formStateDefault);
  }
  function jsonCopy(val) {
    return JSON.parse(JSON.stringify(val));
  }
  function checkFormState(state, defaultState) {}

  onMount(() => {
    // store initial value as default
    formStateDefault = jsonCopy(formState);
  });
  $: {
    formInDefaultState = (formState, formStateDefault) => {
      console.dir(formState);
      console.dir(formStateDefault);
      Object.entries(formState).forEach(([k, v]) => {
        if (formStateDefault[k] !== v) {
          return false;
        }
      });
      return true;
    };
  }
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
  <MotifFormHeader {formId} {formTitle} {formInfo} />
  <fieldset class="user-input">
    <legend>Settings</legend>
    <!--<button class="save-setting">save setting</button>-->
    {#each fieldRows as fields}
      <div class="form-row">
        {#each fields as field}
          <Field {...field} defaultValue={field.value} on:change={formChange} />
        {/each}
      </div>
    {/each}
  </fieldset>
  <!--<section class="show selected-setting">
                <div class="input-wrap">
                    <label for="select-setting">Selected Setting</label>
                    <button id="select-setting-reset">clear</button>
                    <select id="select-setting" name="selected-setting" data-default="new unnamed" data-action="single"></select>
                </div>
            </section>-->
  <MotifFormControls {formId} {formOpen} {formInDefaultState} />
</section>
