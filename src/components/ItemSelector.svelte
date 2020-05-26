<script>
    import { createEventDispatcher } from 'svelte'
    import MotivicUtils from '../MotivicUtils'
    export let itemSelected = false
    export let items = []
    export let itemType = ''
    export let label = ''
    export let selectedItemId = ''
    export let formId = ''
    export let defaultSelection = null
    export let formFieldLayout = false

    const dispatch = createEventDispatcher()
    $: dispatchItemSelection(selectedItemId)

    function dispatchItemSelection(itemId) {
        dispatch('itemSelection', { itemId, itemType, formId })
    }
</script>

<style>
    .input-wrap {
        flex-direction: column;
        width: 100%;
        padding: 10px;
    }
    .field {
        flex-direction: row;
        padding: 0px;
        height: 50px;
        width: 100%;
        position: relative;
        justify-content: space-between;
        max-width: var(--max_main_width);
        align-self: center;
    }
    select {
        width: 50%;
    }
</style>

<section>
    <div class="input-wrap" class:field={formFieldLayout}>
        <label for="select-item">
            {#if label}
                {label}
            {:else}selected {MotivicUtils.general.singularize(itemType)}:{/if}
        </label>
        <select
            id="select-item"
            name="selected-item"
            bind:value={selectedItemId}>
            {#if defaultSelection}
                <option value={defaultSelection.id}>
                    {defaultSelection.name}
                </option>
            {/if}
            {#each items as item}
                <option value={item.id}>{item.name}</option>
            {/each}
        </select>
        {#if itemSelected}
            <button id="select-item-reset">clear</button>
        {/if}
    </div>
</section>
