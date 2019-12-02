<script>
  import Field from "./Field.svelte";
  export let type = "";
  export let id = "";
  export let dataKey = "";
  export let label = "";
  export let defaultValue = "";
  export let required = true;
  export let min = 0;
  export let max = 0;
  export let step = 1;
</script>

<style>

</style>

<Field
  {type}
  {id}
  {dataKey}
  {label}
  {defaultValue}
  {required}
  {min}
  {max}
  {step}
  inputmode="numeric"
  pattern="[0-9]*" />
