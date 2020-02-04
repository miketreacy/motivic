<script>
  import { createEventDispatcher } from "svelte";
  import Config from "./Config.js";
  import Utils from "./Utils";
  import MotifForm from "./MotifForm.svelte";
  import ItemSelector from "./ItemSelector.svelte";
  export let motif = null;
  export let motifs = [];
  export let selectedMotifId = "";
  const formId = "transformer";
  const formTitle = "Transformer";
  const formInfo =
    "applies transformations to an existing melody to produce counterpoint";
  const formCanSubmitDefault = false;
  let formState = {
    motif: null,
    transpose: 0,
    invert: false,
    reverse_rhythm_0: false,
    reverse_pitch_1: false,
    augment: 0,
    diminish: 0,
    stagger: 0
  };
  const fieldRows = [
    [
      {
        type: "number",
        id: "transpose",
        label: "Transpose",
        value: 0,
        step: 1,
        min: -11,
        max: 11
      },
      {
        type: "checkbox",
        id: "invert",
        label: "Invert",
        value: false
      }
    ],
    [
      {
        type: "checkbox",
        id: "reverse_pitch_1",
        label: "Reverse Pitches",
        value: false
      },
      {
        type: "checkbox",
        id: "reverse_rhythm_0",
        label: "Reverse Durations",
        value: false
      }
    ],
    [
      {
        type: "number",
        id: "augment",
        label: "Augment",
        value: 0,
        step: 2,
        min: 0,
        max: 4
      },
      {
        type: "number",
        id: "diminish",
        label: "Diminish",
        value: 0,
        step: 2,
        min: 0,
        max: 4
      },
      {
        type: "number",
        id: "stagger",
        label: "Stagger",
        value: 0,
        step: 1,
        min: 0,
        max: 64
      }
    ],
    [
      {
        type: "text",
        id: "name",
        label: "Name",
        max: 16,
        apiField: false
      }
    ]
  ];

  const submitOptions = Config.api.operations.transformer;
  const dispatch = createEventDispatcher();

  function responseCallbackFn(data) {
    const newMotif = data && data.response ? data.response : null;
    console.info(`SUCCESS response from ${formId.toUpperCase()} API`);
    console.dir(newMotif);
    let { transformations, melody: parentMotif } = data.request.body;
    // add the newly-created variation motif
    let [success, msg, savedVariationMotif] = Utils.userData.processNewItem(
      newMotif,
      "motifs",
      `${motif.name}_var_1`,
      "",
      parentMotif.id,
      transformations
    );

    // update the existing theme motif to reflect its new variation
    // parentMotif.variations = [...parentMotif.variations, savedVariationMotif];
    // Utils.userData.persist(parentMotif, "motifs");
    dispatch("displayAlert", {
      visible: true,
      type: success ? "success" : "error",
      message: msg,
      displayTimeMs: 1500,
      dismissable: false
    });
  }

  function getTransformations(state) {
    let list = [];
    for (let [key, value] of Object.entries(state)) {
      console.log(`${key}: ${value}`);
      if (value !== formState[key]) {
        let map = { type: key, params: [value] };
        if (typeof value === "boolean") {
          map.params = [];
        }
        list.push(map);
      }
    }

    //TODO: refactor this hot mess 😰
    let reverseMaps = list.filter(map => map.type.split("_")[0] === "reverse");
    if (reverseMaps.length) {
      let thisMap = { type: "reverse", params: [false, false] };
      reverseMaps.forEach(map => {
        let i = list.findIndex(el => el === map);
        let [, , valIdx] = map.type.split("_");
        list.splice(i, 1);
        thisMap.params[parseInt(valIdx)] = true;
      });
      list.push(thisMap);
    }
    console.log(list);
    return list;
  }

  function getRequestBodyFn(state) {
    return { melody: motif, transformations: getTransformations(state) };
  }

  function handleItemSelection(event) {
    selectedMotifId = event.detail.itemId;
  }

  function selectMotif(motifId) {
    console.log(`selectMotif() called`);
    motif = motifs.find(m => m.id === motifId);
    return motif;
  }

  let props = {
    formId,
    formTitle,
    formInfo,
    formState,
    fieldRows,
    responseCallbackFn,
    submitOptions,
    getRequestBodyFn,
    formCanSubmitDefault
  };

  $: motif = selectMotif(selectedMotifId);
  $: console.dir(motif);
  $: console.log(`selectedMotifId = ${selectedMotifId}`);
</script>

<style>

</style>

<MotifForm {...props} on:displayToggle>
  <ItemSelector
    {formId}
    items={motifs}
    itemType="motifs"
    selectedItemId={selectedMotifId}
    on:itemSelection={handleItemSelection} />
</MotifForm>
