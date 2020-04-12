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

  let newMotif = null;
  const leapRangeConfig = {
    min: { min: 0, max: 11 },
    max: { min: 2, max: 48 }
  };
  // some state is local to this form and updated in stateFilterFn()
  let lowOctave = Config.default.octave.low;
  let highOctave = Config.default.octave.high;
  let leapRange = getLeapRange(lowOctave, highOctave);
  let formState = {
    key: "c",
    mode: "chromatic",
    octave_low: 3,
    octave_high: 5,
    leap_min: 1,
    leap_max: 24,
    duration_min: 4,
    duration_max: 16,
    timeSignature_beat_0: 4,
    timeSignature_unit_1: 4,
    tempo_type: "bpm",
    tempo_units: 120,
    length_type: "measures",
    length_units: 2
  };
  const submitOptions = Config.api.operations.randomizer;
  const dispatch = createEventDispatcher();

  let rowLayout = "";

  function getLeapRange(lowOctave, highOctave) {
    let minNoteVal = Utils.melody.getNoteValue("c", lowOctave);
    let maxNoteVal = Utils.melody.getNoteValue("b", highOctave);
    let noteValRange = maxNoteVal - minNoteVal + 1;
    let maxMax = Math.min(leapRangeConfig.max.max, noteValRange - 1);
    let minMax = Math.min(leapRangeConfig.min.max, maxMax - 6);
    let range = {
      min: { min: 0, max: minMax },
      max: { min: minMax + 2, max: maxMax }
    };
    return range;
  }
  function getFieldRows(leapRange) {
    return [
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
          info: "Uses piano octaves (Scientific Pitch Notation)",
          rowLayout
        },
        {
          type: "number",
          id: "octave_high",
          label: "high octave",
          value: 5,
          step: 1,
          min: 0,
          max: 8,
          info: "Uses piano octaves (Scientific Pitch Notation)",
          rowLayout
        }
      ],
      [
        {
          type: "number",
          id: "leap_min",
          label: "min leap",
          value: 1,
          step: 1,
          min: leapRange.min.min,
          max: leapRange.min.max,
          info: "Minimum leap (in half-steps) between two consecutive notes",
          rowLayout
        },
        {
          type: "number",
          id: "leap_max",
          label: "max leap",
          value: leapRange.max.max,
          step: 1,
          min: leapRange.max.min,
          max: leapRange.max.max,
          info: "Maximum leap (in half-steps) between two consecutive notes",
          rowLayout
        }
      ],
      [
        {
          type: "select",
          id: "duration_min",
          label: "min note duration",
          value: 4,
          options: noteDurations,
          info: "Minimum note length",
          rowLayout
        },
        {
          type: "select",
          id: "duration_max",
          label: "max note duration",
          value: 16,
          options: noteDurations,
          info: "Maximum note length",
          rowLayout
        }
      ],
      [
        {
          type: "select",
          id: "timeSignature_beat_0",
          label: "time signature beat",
          value: 4,
          options: timeSignatureBeats,
          info: "Beats per measure",
          rowLayout
        },
        {
          type: "select",
          id: "timeSignature_unit_1",
          label: "time signature unit",
          value: 4,
          options: timeSignatureUnits,
          info: "Which note duration gets one beat (4 = quarter note, etc)",
          rowLayout
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
  }

  function validateMinMaxFields(field, minField, maxField, newState, oldState) {
    let minVal = oldState[minField];
    let maxVal = oldState[maxField];
    if (field === minField) {
      minVal = newState[field];
      maxVal = Math.max(minVal, maxVal);
    }
    if (field === maxField) {
      maxVal = newState[field];
      minVal = Math.min(maxVal, minVal);
    }
    newState[minField] = minVal;
    newState[maxField] = maxVal;
    return newState;
  }

  /**
   * Makes sure that the possible min/max leap values are updated
   * to reflect reality when the low/high octave selections change.
   * example: a one octave range can not accomadate leaps of an octave or more.
   *
   */
  function adjustLeapsByOctaves(newState, oldState) {
    let lowOct = newState["octave_low"] || oldState["octaveLow"];
    let highOct = newState["octave_high"] || oldState["octave_high"];
    // updating these closure variables for component state management
    lowOctave = lowOct;
    highOctave = highOct;
    let minNoteVal = Utils.melody.getNoteValue("c", lowOct);
    let maxNoteVal = Utils.melody.getNoteValue("b", highOct);
    let noteValRange = maxNoteVal - minNoteVal + 1;
    let leapMax = Math.min(oldState["leap_max"], noteValRange - 1);
    let leapMin = Math.min(oldState["leap_min"], leapMax - 6);
    newState["leap_max"] = leapMax;
    newState["leap_min"] = leapMin;
    console.log(
      `adjustLeapsByOctaves(): minNoteVal=${minNoteVal}, maxNoteVal=${maxNoteVal} noteValRange=${noteValRange}`
    );
    return newState;
  }

  function stateFilterFn(field, newState, oldState) {
    if (field.includes("octave_")) {
      newState = validateMinMaxFields(
        field,
        "octave_low",
        "octave_high",
        newState,
        oldState
      );
      newState = adjustLeapsByOctaves(newState, oldState);
    }
    if (field.includes("leap_")) {
      newState = validateMinMaxFields(
        field,
        "leap_min",
        "leap_max",
        newState,
        oldState
      );
    }
    if (field.includes("duration_")) {
      newState = validateMinMaxFields(
        field,
        "duration_min",
        "duration_max",
        newState,
        oldState
      );
    }
    return newState;
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
      message: success ? `New random motif created!` : msg,
      displayTimeMs: 1500,
      dismissable: false,
      top: 45
    });
    newMotif = createdMotif;
  }

  let staticProps = {
    formId,
    formTitle,
    formInfo,
    responseCallbackFn,
    submitOptions,
    getRequestBodyFn,
    stateFilterFn,
    formCanSubmitDefault
  };
  $: leapRange = getLeapRange(lowOctave, highOctave);
  $: fieldRows = getFieldRows(leapRange);
</script>

<style>

</style>

<MotifForm
  {...staticProps}
  {fieldRows}
  {formState}
  {formOpen}
  {newMotif}
  on:displayToggle
  on:displayCrudModal
  on:displayAlert />
