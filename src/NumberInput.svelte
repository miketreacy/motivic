<script>
    import { onMount } from 'svelte'
    import { createEventDispatcher } from 'svelte'
    export let id = ''
    export let required = true
    export let min = 0
    export let max = 0
    export let step = 1
    export let value
    export let form = ''
    export let apiField
    export let displayClass = 'display-block'
    export let roughIncrement = 0
    export let presetState = false

    const dispatch = createEventDispatcher()
    /**
     * Keeps text input on number inputs within defined HTML attributes (step, min, max)
     * @param {number} [stepChange] Optional change to input value from another event (in step units).
     * @return {number} Processed input value.
     */
    function getUpdatedValue(stepChange) {
        let val = (value || min) + stepChange * step
        let newVal = validateValue(val)
        let stepAdjustedVal = newVal - (newVal % step)
        let zeroValue = min <= 0 && stepAdjustedVal === 0
        return zeroValue ? 0 : Math.max(stepAdjustedVal, step)
    }

    function numChange(e) {
        let targEl = e.target
        let change = targEl.getAttribute('data-num-change')
        let int = parseInt(change, 10)
        value = getUpdatedValue(int)
    }

    function validateInput(el) {
        let valid = el.checkValidity()
        console.info(`${el.id} valid: ${valid}`)
        if (!valid) {
            value = validateValue(el.value)
            let label = document.querySelector(`label[for="${el.id}"]`)
                .textContent
            dispatch('displayAlert', {
                visible: true,
                type: 'warn',
                message: `${label} ${el.validationMessage}`,
                displayTimeMs: 1500,
                dismissable: false,
                top: el.getBoundingClientRect().top - 70,
                displayLabel: false
            })
        }
    }

    function inputHandler(e) {
        console.info(`inputHandler()`, e.type)
        let el = e.target
        let elValue = parseInt(el.value, 10)
        let maxDigits = max.toString().length
        let valueDigits = elValue.toString().length
        if (
            (!elValue && elValue < min) ||
            valueDigits >= maxDigits ||
            elValue * 10 > max
        ) {
            validateInput(el)
        }
    }

    function changeHandler(e) {
        let el = e.target
        validateInput(el)
    }

    function dispatchValueChange(val) {
        if (apiField) {
            dispatch('inputValueChange', {
                value: val,
                field: id,
                form,
                presetStateChange: presetState
            })
        }
    }

    function validateValue(val) {
        let result = Math.min(Math.max(min, parseInt(val, 10)), max)
        console.info(`validateValue() called ${val} => ${result}`)
        return result
    }

    onMount(() => {
        value = validateValue(value)
    })

    $: dispatchValueChange(value)
</script>

<style>
    ._number-input {
        border: none;
        position: relative;
    }

    .qty-controls {
        display: flex;
        flex: 1 1 0;
        flex-direction: row;
        padding: 0;
        justify-content: space-between;
        box-sizing: content-box;
        min-width: 140px;
    }

    .qty-controls.rough button.fine {
        display: none;
    }

    input {
        box-sizing: border-box;
        padding: 0;
        flex: 1 1 0;
        min-width: var(--touch_min_width);
        max-width: var(--touch_min_width);
        text-align: center;
        border: none;
    }
    button {
        color: var(--theme_color_1);
        background-color: var(--theme_color_2);
        position: static;
        max-width: var(--touch_min_width);
        flex: 1 1 0;
        cursor: pointer;
        border: none;
    }
    button span {
        pointer-events: none;
    }

    .rough {
        flex-direction: row;
    }

    .increment {
        font-size: var(--theme_font_size_1);
    }
</style>

<div class="qty-controls" class:rough={roughIncrement}>
    {#if roughIncrement}
        <button
            class="num-change rough"
            data-num-change="-10"
            name="qty"
            on:click|self={numChange}>
            -
            <span class="increment">{roughIncrement}</span>
        </button>
    {/if}
    <button
        class="num-change fine"
        data-num-change="-1"
        name="qty"
        on:click|self={numChange}>
        -
    </button>
    <input
        type="number"
        name={id}
        {id}
        class={displayClass}
        bind:value
        {required}
        {min}
        {max}
        {step}
        inputmode="numeric"
        pattern="[0-9]*"
        on:click={e => e.target.select()}
        on:input={inputHandler}
        on:change={changeHandler} />
    <button
        class="num-change fine"
        data-num-change="1"
        name="qty"
        on:click|self={numChange}>
        +
    </button>
    {#if roughIncrement}
        <button
            class="num-change rough"
            data-num-change="10"
            name="qty"
            on:click|self={numChange}>
            +
            <span class="increment">{roughIncrement}</span>
        </button>
    {/if}
</div>
