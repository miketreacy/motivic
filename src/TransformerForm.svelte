<script>
  import Config from "./Config.js";
  import MotifForm from "./MotifForm.svelte";
  import ItemSelector from "./ItemSelector.svelte";
  export let motif = null;
  export let motifs = [];
  const formId = "transformer";
  const formTitle = "Transformer";
  const formInfo =
    "applies transformations to an existing melody to produce counterpoint";
  const formCanSubmitDefault = false;
  let formState = {
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

  let selectedMotifId = "";
  function submitCallbackFn(melody) {
    console.info(`SUCCESS response from ${formId.toUpperCase()} API`);
    console.dir(melody);
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
    motif = motifs.find(m => m.id === motifId);
  }

  let props = {
    formId,
    formTitle,
    formInfo,
    formState,
    fieldRows,
    submitCallbackFn,
    submitOptions,
    getRequestBodyFn,
    formCanSubmitDefault
  };

  $: motif = motifs.find(m => m.id === selectedMotifId);
  $: console.dir(motif);
</script>

<style>

</style>

<MotifForm {...props} on:displayToggle>
  <ItemSelector
    {formId}
    items={motifs}
    itemType="motifs"
    selectedItemId={motifs.length ? motifs[0].id : ''}
    on:itemSelection={handleItemSelection} />
</MotifForm>
