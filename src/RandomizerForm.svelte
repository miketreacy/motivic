<script>
  import MotifForm from "./MotifForm.svelte";
  const submitFunction = state => {
    console.log(`RANDOMIZER FORM SUMITTED!`);
    console.dif(state);
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
  const formId = "randomizer";
  const formTitle = "Randomizer";
  const formInfo =
    "generates a random monophonic melody based on user settings";
  let formState = {
    key: "c",
    mode: "chromatic",
    octave_low: 3,
    octave_high: 5
  };
  const fieldRows = [
    [
      {
        type: "select",
        id: "key",
        label: "key",
        value: "c",
        options: keys
      },
      {
        type: "select",
        id: "mode",
        label: "mode",
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
