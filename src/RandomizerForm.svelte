<script>
  import MotifForm from "./MotifForm.svelte";
  const submitFunction = e => {
    console.log(`RANDOMIZER FORM SUBMITTED!`);
    console.dir(formState);
  };
  const keys = [
    "c",
    "c#",
    "d",
    "d#",
    "e",
    "f",
    "f#",
    "g",
    "g#",
    "a",
    "a#",
    "b"
  ];
  const modes = [
    "chromatic",
    "whole",
    "ionian",
    "dorian",
    "phrygian",
    "lydian",
    "mixolydian",
    "aeolian",
    "locrian"
  ];
  const timeSignatureBeats = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const timeSignatureUnits = [1, 2, 4, 8, 12, 16];
  const formId = "randomizer";
  const formTitle = "Randomizer";
  const formInfo =
    "generates a random monophonic melody based on user settings";
  let formState = {
    key: "c",
    mode: "chromatic",
    octave_low: 3,
    octave_high: 5,
    leap_min: 1,
    leap_max: 24,
    timeSignature_beat: 4,
    timeSignature_unit: 4,
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
        options: keys
      },
      {
        type: "select",
        id: "mode",
        label: "Mode",
        value: "chromatic",
        options: modes
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
        id: "timeSignature_beat",
        label: "Time Signature Beat",
        value: 4,
        options: timeSignatureBeats
      },
      {
        type: "select",
        id: "timeSignature_unit",
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

  let props = {
    formId,
    formTitle,
    formInfo,
    formState,
    fieldRows,
    submitFunction
  };
</script>

<style>

</style>

<MotifForm {...props} />
