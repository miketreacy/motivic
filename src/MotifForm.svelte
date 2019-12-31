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

  function jsonCopy(val) {
    return JSON.parse(JSON.stringify(val));
  }
  function logAll() {
    console.log("formState");
    console.dir(formState);
    console.log("formStateDefault");
    console.dir(formStateDefault);
  }
  function validateOctaves(field, newState, oldState) {
    let lowOctave = oldState["octave_low"];
    let highOctave = oldState["octave_high"];
    if (field === "octave_low") {
      lowOctave = newState[field];
      highOctave = Math.max(lowOctave, highOctave);
    }
    if (field === "octave_high") {
      highOctave = newState[field];
      lowOctave = Math.min(highOctave, lowOctave);
    }
    newState["octave_high"] = highOctave;
    newState["octave_low"] = lowOctave;
    return newState;
  }

  function getNewState(field, value) {
    let oldState = jsonCopy(formState);
    let newState = { [field]: value };

    if (field.includes("octave_")) {
      newState = validateOctaves(field, newState, oldState);
    }
    newState = Object.entries(newState).reduce((obj, [k, v]) => {
      obj[k] = v;
      return obj;
    }, oldState);
    return newState;
  }

  function getUpdatedFieldRows(state) {
    return fieldRows.map(row => {
      return row.map(field => {
        field.value = state[field.id];
        return field;
      });
    });
  }

  function formChange(event) {
    let fieldId = event.detail.field;
    let fieldValue = event.detail.value;
    let newState = getNewState(fieldId, fieldValue);
    formState = newState;
  }

  function isInDefaultState(state, stateDefault) {
    let diffKeys = [];
    let result = true;
    if (!(state && stateDefault)) {
      return result;
    }
    logAll();
    Object.entries(formState).forEach(([k, v]) => {
      if (stateDefault[k] !== v) {
        let diffKey = [k, stateDefault[k], v];
        diffKeys.push(diffKey);
      }
    });
    if (diffKeys.length) {
      let diffMsg = diffKeys
        .map(diff => `${diff[0]} was ${diff[1]}, is ${diff[2]}`)
        .join("\n");
      console.info(diffMsg);
      result = false;
    }
    console.info(`formInDefaultState: ${result}`);
    return result;
  }

  onMount(() => {
    // store initial values as defaults
    formStateDefault = [].concat(...fieldRows).reduce((obj, field) => {
      obj[field.id] = field.value;
      return obj;
    }, {});
    formState = jsonCopy(formStateDefault);
    logAll();
  });

  $: {
    formInDefaultState = isInDefaultState(formState, formStateDefault);
    fieldRows = getUpdatedFieldRows(formState);
  }
</script>

<style>
  section {
    flex-direction: column;
  }
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

<section id={formId} class="show closed form">
  <MotifFormHeader {formId} {formTitle} {formInfo} />
  <fieldset class="user-input">
    <legend>Settings</legend>
    <!--<button class="save-setting">save setting</button>-->
    {#each fieldRows as fields}
      <div class="form-row">
        {#each fields as field}
          <Field
            {...field}
            defaultValue={field.value}
            on:valueChange={formChange} />
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
  <MotifFormControls
    {formId}
    {formOpen}
    {formInDefaultState}
    submitFormFn={submitFunction} />
</section>
