<script>
    import { createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    export let id = ''
    export let options = []
    export let displayCompact = false
    export let displayVeryCompact = false
    export let disabled = true
    export let optionIconMap = null
    export let multiDim = true
    export let optionIds = false

    const dispatch = createEventDispatcher()

    let iconContent = ''
    let selection = optionIds
        ? options[0].id
        : multiDim
        ? options[0][0]
        : options[0]

    function resetSelection(disabled) {
        return disabled ? options[0][0] : selection
    }

    function getOptionDisplay(name, isCompact = false, optionIds = false) {
        console.info(name)
        if (optionIds) {
            return options.find((opt) => opt.id === name).name
        }
        let shortName = multiDim
            ? options.find(([full, _]) => full === name)[1]
            : null
        return isCompact && multiDim ? shortName : name
    }

    function updateSelection(option) {
        dispatch('updateSelection', { selection: option })
    }

    $: iconContent = optionIconMap ? optionIconMap[selection] : null
    $: selection = resetSelection(disabled)
    $: updateSelection(selection)
</script>

<div
    class="wrap"
    {disabled}
    class:compact={displayCompact}
    class:large={optionIds}
    class:very-compact={displayVeryCompact}
>
    {#if optionIconMap && !displayCompact}
        <span class="icon">
            {@html iconContent}
        </span>
    {/if}

    <span class="value"
        >{getOptionDisplay(selection, displayCompact, optionIds)}</span
    >

    <select bind:value={selection} {disabled} {id}>
        {#if optionIds}
            {#each options as option}
                <option value={option.id}>
                    <span>{option.name}</span>
                </option>
            {/each}
        {:else if multiDim}
            {#each options as [fullName, shortName]}
                <option value={fullName}>
                    <span>{fullName}</span>
                </option>
            {/each}
        {:else}
            {#each options as name}
                <option value={name}>
                    <span>{name}</span>
                </option>
            {/each}
        {/if}
    </select>
</div>

<style>
    .wrap {
        position: relative;
        white-space: normal;
        min-width: 58.2px;
        flex: 1 1 0;
        max-width: 100px;
        margin: 0;
        box-sizing: border-box;
    }
    .wrap.large {
        max-width: 100%;
    }
    .wrap.compact {
        max-width: 60px;
        min-width: var(--touch);
        margin: 0px;
    }
    .wrap.very-compact {
        max-width: 45px;
        min-width: var(--touch);
        margin: 0px;
    }
    .icon {
        position: absolute;
        z-index: var(--front);
        top: 3px;
        color: var(--theme_color_2);
        pointer-events: none;
    }
    [disabled='true'] .icon {
        color: var(--theme_color_6);
    }
    .value {
        position: absolute;
        z-index: var(--front);
        color: var(--theme_color_2);
        pointer-events: none;
        top: 20px;
        font-size: var(--theme_font_size_1);
    }
    [disabled='true'] .value {
        color: var(--theme_color_6);
    }
    .compact .value {
        top: 13px;
    }
    select {
        white-space: pre;
        padding-top: 20px;
        margin: 0;
        color: var(--theme_color_1);
    }
    select:disabled {
        color: var(--theme_color_4);
    }
    .compact select {
        padding: 12px 7px 7px 7px;
    }
    option {
        white-space: pre;
    }
</style>
