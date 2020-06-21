<script>
    import { createEventDispatcher } from 'svelte'
    import MotivicUtils from '../MotivicUtils'
    export let itemGroups = []
    export let itemType = ''
    export let label = ''
    export let selectedItemId = ''
    export let formId = ''
    export let defaultSelection = null
    export let formFieldLayout = false

    const dispatch = createEventDispatcher()
    $: dispatchItemSelection(selectedItemId)

    function dispatchItemSelection(itemId) {
        if (
            defaultSelection &&
            defaultSelection.id &&
            defaultSelection.id === itemId
        ) {
            return
        }
        let selectedItemType = itemGroups.find(group =>
            group.items.some(item => item.id === itemId)
        ).type
        dispatch('itemSelection', { itemId, selectedItemType, formId })
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
            {#if itemGroups.length === 1}
                {#each itemGroups[0].items as item}
                    <option value={item.id} data-type={itemGroups[0].type}>
                        {item.name}
                    </option>
                {/each}
            {:else}
                {#each itemGroups.filter(itemGroup => itemGroup.items.length) as itemGroup}
                    <optgroup label={itemGroup.label}>
                        {#each itemGroup.items as item}
                            <option value={item.id} data-type={itemGroup.type}>
                                {item.name}
                            </option>
                        {/each}
                    </optgroup>
                {/each}
            {/if}
        </select>
    </div>
</section>
