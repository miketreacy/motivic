<script>
    import Input from './Input.svelte'
    export let type = '';
    export let id = '';
    export let dataKey = '';
    export let label = '';
    export let defaultValue = '';
    export let required = true;
    export let min = 0;
    export let max = 0;
    export let step = 1;
</script>

<Input
        type={type}
        id={id}
        dataKey={dataKey}
        label={label}
        defaultValue={defaultValue}
        required={required}
        min={min}
        max={max}
        step={step}
        inputmode="numeric"
        pattern="[0-9]*"
    />

<style>

</style>