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
  export let stateFilterFn = (field, newState, oldState) => newState;
  export let responseCallbackFn = Function.prototype;
  export let getRequestBodyFn = Function.prototype;
  export let formCanSubmitDefault = false;
  export let newMotif = null;
  export let topControls = true;
  export let formControls = ["toggle", "reset", "apply"];
  export let formOpen = false;

  let scrollPos;
  const apiUrl = submitOptions
    ? `${Config.api.baseURL}${submitOptions.path}`
    : "";
  let formStateDefault = {};
  let formInDefaultState = true;
  let formCanSubmit = true;
  let formIsSubmitting = false;
  const dispatch = createEventDispatcher();

  function dispatchFormToggle(open) {
    dispatch("displayToggle", { section: formId, open: open });
  }

  function toggleFormFn() {
    dispatchFormToggle(!formOpen);
  }

  function logAll() {
    console.log("formState");
    console.dir(formState);
    console.log("formStateDefault");
    console.dir(formStateDefault);
  }

  function getNewState(field, value) {
    console.log(`getNewState() field: ${field} : ${value}`);
    let oldState = Utils.general.clone(formState);
    let newState = { [field]: value };
    newState = stateFilterFn(field, newState, oldState);
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
    console.log(`getUpdatedFieldRows() called with`, state);
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
    scrollPos = 0;
    const reqBody = getRequestBodyFn(formState);
    console.info(`${submitOptions.method} ${submitOptions.path} request body:`);
    console.dir(reqBody);
    // rollDice();
    // toggleLoader(doc.querySelector("#randomize .dice"), true);
    let [data, error] = await Utils.http.awaitFetchTimeout(
      apiUrl,
      getApiParams(reqBody),
      submitOptions.timeoutMilliseconds
    );
    if (data) {
      responseCallbackFn(data);
    } else {
      dispatch("displayAlert", {
        visible: true,
        type: "error",
        message: `${formTitle} API operation failed.\n${error.message}`,
        displayTimeMs: 1500,
        dismissable: true,
        top: 45
      });
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
    padding: 10px;
    display: grid;
    grid-template-columns: 40% 60%;
    grid-template-rows: 40px;
    grid-row-gap: 2px;
    justify-items: flex-start;
    width: 100%;
  }
  fieldset {
    border-style: solid;
    border: none;
    padding: 10px 5px;
    margin: 10px 0;
    width: 100%;
    flex-direction: column;
    background-color: var(--theme_color_5);
    border-radius: 5px;
  }

  .form-row {
    padding: 5px 10px;
    flex-direction: column;
    width: 100%;
  }

  .form-row:last-of-type {
    border-bottom: none;
  }
</style>

<svelte:window bind:scrollY={scrollPos} />
<section id={formId} data-closed={!formOpen}>
  <MotifFormHeader {formId} {formTitle} {formInfo} {formOpen} />

  {#if formOpen}
    {#if topControls}
      <MotifFormControls
        {formOpen}
        {formInDefaultState}
        {toggleFormFn}
        {resetFormFn}
        {submitFormFn}
        {formCanSubmit}
        controls={formControls} />
    {/if}
    {#if newMotif}
      <MotifAudition
        motif={newMotif}
        on:toggleMotifAudition={handleAuditionToggle}
        on:displayCrudModal
        on:displayAlert />
    {/if}
    <slot />
    {#if fieldRows.length}
      <fieldset class="user-input">
        <legend>settings</legend>
        <!--<button class="save-setting">save setting</button>-->
        {#each fieldRows as fields}
          <div class="form-row">
            {#each fields as field}
              <Field
                {...field}
                form={formId}
                on:inputValueChange={formChange}
                on:displayAlert />
            {/each}
          </div>
        {/each}
      </fieldset>
    {/if}
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
    {formOpen}
    {formInDefaultState}
    {toggleFormFn}
    {resetFormFn}
    {submitFormFn}
    {formCanSubmit}
    controls={formControls} />
</section>
