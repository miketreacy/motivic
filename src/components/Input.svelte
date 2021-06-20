<script>
    import { createEventDispatcher } from 'svelte'
    import NumberInput from './NumberInput.svelte'
    export let type = ''
    export let id = ''
    export let required = true
    export let options = []
    export let min = 0
    export let max = 8
    export let step = 1
    export let value = null
    export let accept = ''
    export let displayClass = 'display-block'
    export let roughIncrement = 0
    export let updaterFn = Function.prototype
    export let audioCapture = false

    const dispatch = createEventDispatcher()
    const checkboxValueMap = { on: true, off: false }

    function fileChangeHandler(e) {
        let el = e.target
        dispatch('inputValueChange', {
            value: el.files,
            field: id,
            form: 'uploader'
        })
    }

    function updateValueState(value) {
        let stateDiffMap = { [id]: value }
        updaterFn(stateDiffMap, id)
    }

    function valueChangeHandler(e) {
        let newValue = e.target.value
        if (type === 'checkbox') {
            newValue = checkboxValueMap[newValue]
        }
        updateValueState(newValue)
    }
</script>

<style>
    input,
    select {
        display: block;
        cursor: pointer;
        color: var(--theme_color_2);
        font-size: var(--theme_font_size_2);
        background-color: var(--theme_color_1);
        border: none;
        border-radius: 5px;
        outline: none;
        padding: 5px;
        border: 1px solid var(--theme_color_10);
        margin: 0;
        flex: 1 1 0;
    }
    select {
        padding: 10px;
    }
    .display-flex {
        display: flex;
    }

    input:focus {
        outline: none;
    }

    input[type='checkbox'] {
        width: var(--touch_min_width);
        max-width: var(--touch_min_width);
        margin-right: -6px;
        display: flex;
    }

    input[type='file'] {
        width: auto;
        height: auto;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .checkbox-wrap {
        width: 50%;
        flex-direction: row;
    }
</style>

{#if type == 'select'}
    <select
        class={displayClass}
        {id}
        bind:value
        {required}
        on:change={valueChangeHandler}
        on:blur={valueChangeHandler}>
        {#each options as opt}
            {#if Array.isArray(opt)}
                <option value={opt[0]}>{opt[1]}</option>
            {:else}
                <option>{opt}</option>
            {/if}
        {/each}
    </select>
{:else if type == 'number'}
    <NumberInput
        {id}
        {displayClass}
        {value}
        {required}
        {min}
        {max}
        {step}
        {roughIncrement}
        {updaterFn}
        on:inputValueChange
        on:displayAlert />
{:else if type == 'text'}
    <input
        type="text"
        {id}
        class={displayClass}
        {value}
        placeholder={value}
        {max}
        {required}
        on:change={valueChangeHandler} />
{:else if type == 'checkbox'}
    <div class="checkbox-wrap">
        <input
            type="checkbox"
            {id}
            class={displayClass}
            checked={value}
            {required}
            on:change={valueChangeHandler} />
    </div>
{:else if type == 'file'}
    <input
        type="file"
        {id}
        class={displayClass}
        {accept}
        bind:files={value}
        capture={audioCapture}
        on:change={fileChangeHandler} />
{:else if type == 'hidden'}
    <input type="hidden" {id} class={displayClass} bind:value />
{/if}
