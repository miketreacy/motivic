<script>
  import { createEventDispatcher } from "svelte";
  import MotifForm from "./MotifForm.svelte";
  import Config from "./Config.js";
  import Utils from "./Utils";
  export let formOpen = false;
  const {
    notes,
    modes,
    timeSignatureBeats,
    timeSignatureUnits,
    noteDurations
  } = Config;
  const formId = "randomizer";
  const formTitle = "Randomizer";
  const formInfo =
    "generates a random monophonic melody based on user settings";
  const formCanSubmitDefault = true;
  let formState = {
    key: "c",
    mode: "chromatic",
    octave_low: 3,
    octave_high: 5,
    leap_min: 1,
    leap_max: 24,
    duration_min: 1,
    duration_max: 64,
    timeSignature_beat_0: 4,
    timeSignature_unit_1: 4,
    tempo_type: "bpm",
    tempo_units: 120,
    length_type: "measures",
    length_units: 2
  };
  let newMotif = null;
  const fieldRows = [
    [
      {
        type: "select",
        id: "key",
        label: "key",
        value: "c",
        options: notes,
        info: "The tonic of the melody"
      },
      {
        type: "select",
        id: "mode",
        label: "mode",
        value: "chromatic",
        options: Object.keys(modes),
        info: "The sequence of intervals that comprise the scale"
      }
    ],
    [
      {
        type: "number",
        id: "octave_low",
        label: "low octave",
        value: 3,
        step: 1,
        min: 0,
        max: 8,
        info: "Uses piano octaves (Scientific Pitch Notation)"
      },
      {
        type: "number",
        id: "octave_high",
        label: "high octave",
        value: 5,
        step: 1,
        min: 0,
        max: 8,
        info: "Uses piano octaves (Scientific Pitch Notation)"
      }
    ],
    [
      {
        type: "number",
        id: "leap_min",
        label: "min leap",
        value: 1,
        step: 1,
        min: 1,
        max: 11,
        info: "Minimum leap (in half-steps) between two consecutive notes"
      },
      {
        type: "number",
        id: "leap_max",
        label: "max leap",
        value: 24,
        step: 1,
        min: 2,
        max: 48,
        info: "Maximum leap (in half-steps) between two consecutive notes"
      }
    ],
    [
      {
        type: "select",
        id: "duration_min",
        label: "min note duration",
        value: 1,
        options: noteDurations,
        info: "Minimum note length"
      },
      {
        type: "select",
        id: "duration_max",
        label: "max note duration",
        value: 64,
        options: noteDurations,
        info: "Maximum note length"
      }
    ],
    [
      {
        type: "select",
        id: "timeSignature_beat_0",
        label: "time signature beat",
        value: 4,
        options: timeSignatureBeats,
        info: "Beats per measure"
      },
      {
        type: "select",
        id: "timeSignature_unit_1",
        label: "time signature unit",
        value: 4,
        options: timeSignatureUnits,
        info: "Which note duration gets one beat (4 = quarter note, etc)"
      }
    ],
    [
      {
        type: "hidden",
        id: "tempo_type",
        value: "bpm"
      },
      {
        type: "number",
        id: "tempo_units",
        label: "tempo(bpm)",
        value: 120,
        step: 1,
        min: 60,
        max: 240,
        roughIncrement: 10
      }
    ],
    [
      {
        type: "hidden",
        id: "length_type",
        value: "measures"
      },
      {
        type: "number",
        id: "length_units",
        label: "measures",
        value: 2,
        step: 1,
        min: 1,
        max: 8
      }
    ]
  ];
  const submitOptions = Config.api.operations.randomizer;
  const dispatch = createEventDispatcher();

  function responseCallbackFn(data) {
    const motif = data && data.response ? data.response : null;
    console.info(`SUCCESS response from ${formId.toUpperCase()} API`);
    console.dir(motif);
    let [success, msg, createdMotif] = Utils.userData.processNewItem(
      motif,
      "motifs",
      "my motif"
    );
    dispatch("displayAlert", {
      visible: true,
      type: success ? "success" : "error",
      message: msg,
      displayTimeMs: 1500,
      dismissable: false,
      top: 45
    });
    newMotif = createdMotif;
  }

  function getRequestBodyFn(state) {
    let reqBody = {};
    for (let [key, value] of Object.entries(state)) {
      console.log(`${key}: ${value}`);
      let [propMap, propKey, valIdx] = key.split("_");
      if (propKey) {
        let idx = parseInt(valIdx);
        if (!Number.isNaN(idx)) {
          // is array prop
          reqBody[propMap] = reqBody[propMap] || [];
          reqBody[propMap][idx] = value;
        } else {
          // is nested object prop
          reqBody[propMap] = reqBody[propMap] || {};
          reqBody[propMap][propKey] = value;
        }
      } else {
        // is primitive prop
        reqBody[key] = value;
      }
    }
    return reqBody;
  }

  let staticProps = {
    formId,
    formTitle,
    formInfo,
    formState,
    responseCallbackFn,
    submitOptions,
    getRequestBodyFn,
    formCanSubmitDefault
  };
</script>

<style>

</style>

<MotifForm
  {...staticProps}
  {fieldRows}
  {formOpen}
  {newMotif}
  on:displayToggle
  on:displayCrudModal
  on:displayAlert />
