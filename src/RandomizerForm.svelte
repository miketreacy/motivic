<script>
  import MotifForm from "./MotifForm.svelte";
  export let formId;
  export let formTitle;
  export let formInfo;
  export let submitFunction;
  export let formState = {};
  export let fieldRows = [];

  export let type = "";
  export let id = "";
  export let dataKey = "";
  export let dataIndex = 0;
  export let label = "";
  export let required = true;
  export let options = [];
  export let min = 0;
  export let max = 9;
  export let step = 1;
  export let value = null;

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
  let props = {
    formId: "randomizer",
    formTitle: "Randomizer",
    formInfo: "generates a random monophonic melody based on user settings",
    formState: {},
    fieldRows: [
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
      ]
    ]
  };
</script>

<style>

</style>

<MotifForm {...props} />
