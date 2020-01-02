<script>
  import MotifForm from "./MotifForm.svelte";
  import Config from "./Config.js";
  const { notes, modes, timeSignatureBeats, timeSignatureUnits } = Config;
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
    timeSignature_beat_0: 4,
    timeSignature_unit_1: 4,
    tempo_type: "bpm",
    tempo_units: 120,
    length_type: "measures",
    length_units: 2
  };
  const fieldRows = [
    [
      {
        type: "select",
        id: "key",
        label: "Key",
        value: "c",
        options: notes
      },
      {
        type: "select",
        id: "mode",
        label: "Mode",
        value: "chromatic",
        options: Object.keys(modes)
      }
    ],
    [
      {
        type: "number",
        id: "octave_low",
        label: "Low Octave",
        value: 3,
        step: 1,
        min: 0,
        max: 8
      },
      {
        type: "number",
        id: "octave_high",
        label: "High Octave",
        value: 5,
        step: 1,
        min: 0,
        max: 8
      }
    ],
    [
      {
        type: "number",
        id: "leap_min",
        label: "Min Leap",
        value: 1,
        step: 1,
        min: 1,
        max: 11
      },
      {
        type: "number",
        id: "leap_max",
        label: "Max Leap",
        value: 24,
        step: 1,
        min: 2,
        max: 48
      }
    ],
    [
      {
        type: "select",
        id: "timeSignature_beat_0",
        label: "Time Signature Beat",
        value: 4,
        options: timeSignatureBeats
      },
      {
        type: "select",
        id: "timeSignature_unit_1",
        label: "Time Signature Unit",
        value: 4,
        options: timeSignatureUnits
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
        label: "Tempo(bpm)",
        value: 120,
        step: 1,
        min: 60,
        max: 240
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
        label: "Measures",
        value: 2,
        step: 1,
        min: 1,
        max: 8
      }
    ]
  ];
  const submitOptions = Config.api.operations.randomizer;
  function submitCallbackFn(melody) {
    console.info(`SUCCESS response from ${formId.toUpperCase()} API`);
    console.dir(melody);
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
</script>

<style>

</style>

<MotifForm {...props} />
