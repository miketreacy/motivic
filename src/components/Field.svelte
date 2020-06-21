<script>
    import Input from './Input.svelte'
    export let type = ''
    export let id = ''
    export let label = ''
    export let labelLink = ''
    export let centerLabel = false
    export let required = true
    export let options = []
    export let min = 0
    export let max = 8
    export let step = 1
    export let value = null
    export let accept = ''
    export let wrap = true
    export let roughIncrement = 0
    export let info = ''
    export let rowLayout = 'vertical'
    export let updaterFn = Function.prototype
    export let audioCapture = false
</script>

<style>
    .input-wrap {
        flex-direction: row;
        padding: 0px;
        height: 50px;
        width: 100%;
        position: relative;
        justify-content: space-between;
        max-width: var(--max_main_width);
        align-self: center;
    }

    .input-wrap.vertical {
        flex-direction: column;
        height: 70px;
        width: auto;
    }

    .input-wrap.hidden {
        display: none;
    }

    label {
        display: block;
        padding: 5px;
        flex: 1 1 0;
        text-align: left;
    }
    label.center {
        text-align: center;
    }

    a,
    a:visited {
        text-decoration: underline;
        cursor: help;
    }
</style>

{#if wrap}
    <div
        class="input-wrap"
        class:hidden={type === 'hidden'}
        class:vertical={rowLayout === 'horizontal'}>
        {#if label}
            <label class:center={centerLabel} for={id} title={info}>
                {#if labelLink}
                    <a href={labelLink} target="_blank">{label}</a>
                {:else}{label}{/if}
            </label>
        {/if}
        <Input
            {type}
            {id}
            {required}
            {options}
            {min}
            {max}
            {step}
            {value}
            {accept}
            {roughIncrement}
            {updaterFn}
            {audioCapture}
            on:inputValueChange
            on:displayAlert />
    </div>
{:else}
    {#if label}
        <label class:center={centerLabel} for={id} title={info}>
            {#if labelLink}
                <a href={labelLink} target="_blank">{label}</a>
            {:else}{label}{/if}
        </label>
    {/if}
    <Input
        {type}
        {id}
        {required}
        {options}
        {min}
        {max}
        {step}
        {value}
        {accept}
        {roughIncrement}
        {updaterFn}
        {audioCapture}
        on:inputValueChange
        on:displayAlert />
{/if}
