<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import Config from "./Config.js";
  import Utils from "./Utils";
  import Field from "./Field.svelte";
  import MotifFormHeader from "./MotifFormHeader.svelte";
  import MotifFormControls from "./MotifFormControls.svelte";
  import MotifAudition from "./MotifAudition.svelte";
  export let formId;
  export let formTitle;
  export let formInfo;
  export let formState = {};
  export let fieldRows = [];
  export let submitOptions = null;
  export let responseCallbackFn = Function.prototype;
  export let getRequestBodyFn = Function.prototype;
  export let formCanSubmitDefault = false;
  export let newMotif = null;
  const apiUrl = `${Config.api.baseURL}${submitOptions.path}`;
  let formStateDefault = {};
  let formOpen = false;
  let formInDefaultState = true;
  let formCanSubmit = true;
  let formIsSubmitting = false;
  const dispatch = createEventDispatcher();

  function dispatchFormToggle(open) {
    dispatch("displayToggle", { section: formId, open: open });
  }

  function toggleFormFn() {
    formOpen = !formOpen;
    dispatchFormToggle(formOpen);
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
    console.log(`getNewState() field: ${field} : ${value}`);
    let oldState = Utils.general.clone(formState);
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

  function getResetValue(fieldType) {
    switch (fieldType) {
      case "text":
        return "";
      case "number":
        return 0;
      case "checkbox":
        return false;
      default:
        return "";
    }
  }

  function getUpdatedFieldRows(state) {
    return fieldRows.map(row => {
      return row.map(field => {
        if (field.id in state) {
          field.value = state[field.id];
        } else {
          field.value = getResetValue(field.type);
        }
        return field;
      });
    });
  }

  function formChange(event) {
    const fieldForm = event.detail.form;
    const fieldId = event.detail.field;
    const fieldValue = event.detail.value;
    console.log(`formChange()`);
    console.dir(event.detail);
    if (fieldForm === formId) {
      let newState = getNewState(fieldId, fieldValue);
      formState = newState;
    }
  }

  function isInDefaultState(state, stateDefault) {
    let diffKeys = [];
    let result = true;
    if (!(state && stateDefault)) {
      return result;
    }
    // logAll();
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
      result = false;
    }
    return result;
  }

  function canFormSubmit(inDefaultState, isSubmitting) {
    let result = true;
    if (isSubmitting) {
      result = false;
    }
    if (inDefaultState && !formCanSubmitDefault) {
      result = false;
    }
    return result;
  }

  function resetFormFn() {
    formState = formStateDefault;
  }

  function getApiParams(payload) {
    let { method, mode, headers } = submitOptions;
    return {
      method,
      body: JSON.stringify(payload),
      mode,
      headers
    };
  }

  async function submitFormFn() {
    formIsSubmitting = true;
    const reqBody = getRequestBodyFn(formState);
    console.info(`${submitOptions.method} ${submitOptions.path} request body:`);
    console.dir(reqBody);
    // rollDice();
    // toggleLoader(doc.querySelector("#randomize .dice"), true);
    let data = await Utils.http.awaitFetch(apiUrl, getApiParams(reqBody));
    responseCallbackFn(data);
    if (formOpen) {
      // toggleFormFn();
    }
    formIsSubmitting = false;
  }

  onMount(() => {
    // store initial values as defaults
    formStateDefault = Utils.general.clone(formState);
    // logAll();
  });

  function handleAuditionToggle(event) {
    newMotif = event.detail.motif;
  }

  $: {
    formInDefaultState = isInDefaultState(formState, formStateDefault);
    formCanSubmit = canFormSubmit(formInDefaultState, formIsSubmitting);
    fieldRows = getUpdatedFieldRows(formState);
  }
</script>

<style>
  section {
    flex-direction: column;
  }
  section[data-closed="true"] {
    margin-top: 2px;
    flex-direction: row;
    border: 1px dashed var(--theme_color_6);
    padding: 10px;
  }
  fieldset {
    border-style: solid;
    padding: 0;
    margin: 0;
    width: 100%;
    flex-direction: column;
    background-color: var(--theme_color_5);
  }

  .form-row {
    padding: 5px 10px;
    flex-direction: column;
    border-bottom: 1px dotted var(--theme_color_10);
    width: 100%;
  }

  .form-row:last-of-type {
    border-bottom: none;
  }
</style>

<section id={formId} data-closed={!formOpen}>
  <MotifFormHeader {formId} {formTitle} {formInfo} {formOpen} />

  {#if formOpen}
    <MotifFormControls
      {formId}
      {formOpen}
      {formInDefaultState}
      {toggleFormFn}
      {resetFormFn}
      {submitFormFn}
      {formCanSubmit} />
    {#if newMotif}
      <MotifAudition
        motif={newMotif}
        on:toggleMotifAudition={handleAuditionToggle}
        on:displayCrudModal />
    {/if}
    <slot />
    <fieldset class="user-input">
      <legend>Settings</legend>
      <!--<button class="save-setting">save setting</button>-->
      {#each fieldRows as fields}
        <div class="form-row">
          {#each fields as field}
            <Field {...field} form={formId} on:inputValueChange={formChange} />
          {/each}
        </div>
      {/each}
    </fieldset>
  {/if}
  <!-- <section class="show selected-setting">
    <div class="input-wrap">
      <label for="select-setting">Selected Setting</label>
      <button id="select-setting-reset">clear</button>
      <select
        id="select-setting"
        name="selected-setting"
        data-default="new unnamed"
        data-action="single" />
    </div>
  </section> -->
  <MotifFormControls
    {formId}
    {formOpen}
    {formInDefaultState}
    {toggleFormFn}
    {resetFormFn}
    {submitFormFn}
    {formCanSubmit} />
</section>
