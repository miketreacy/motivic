<script>
    import Config from '../Config'
    import { slide } from 'svelte/transition'
    export let settings = {}
    export let title = ''
    let displayList = false
    const getKeyVal = (key, val) => {
        let value = settings[key]
        if (value !== undefined && value !== null) {
            return [key, value]
        } else {
            return null
        }
    }
    const getUnitVal = (key, val) => {
        if (typeof val === 'object' && 'type' in val && 'units' in val) {
            return [val.type, val.units]
        } else {
            return null
        }
    }
    const displayConfig = {
        settings: {
            key: getKeyVal,
            mode: getKeyVal,
            timeSignature: (key, val) => {
                Array.isArray(val)
                    ? ['time signature', `${val.join('/')}`]
                    : null
            },
            tempo: getUnitVal,
            length: getUnitVal
        },
        transformations: {
            transpose: (key, val) =>
                val != null ? [`${key}d`, `${val} half-steps`] : null,
            invert: (key, val) => ['contour', 'inverted'],
            reverse: (key, val) => {
                // TODO: add logic for parsing reverse transformation settings
                var boolMap = { false: false, true: true }
                let [pitches, durations] = val.split(', ')
                let results = []
                if (boolMap[pitches]) {
                    results.push(['pitches', 'reversed'])
                }
                if (boolMap[durations]) {
                    results.push(['durations', 'reversed'])
                }
                return results.length ? results : null
            },
            augment: (key, val) => [`durations ${key}ed`, `${val}x`],
            diminish: (key, val) => [`durations ${key}ed`, `${val}x`],
            stagger: (key, val) =>
                val != null ? [`${key}ed`, `${val} 64th notes`] : null
        }
    }

    function toggleDisplay() {
        displayList = !displayList
    }

    let formattedSettings = Object.keys(displayConfig[title]).reduce(
        (map, key) => {
            if (key in settings) {
                let result = displayConfig[title][key](key, settings[key])
                if (result != null) {
                    if (Array.isArray(result[0])) {
                        result.forEach(([k, v]) => {
                            map[k] = v
                        })
                    } else {
                        let [k, v] = result
                        map[k] = v
                    }
                }
            }

            return map
        },
        {}
    )
</script>

<style>
    .wrap {
        flex-direction: column;
        width: 100%;
    }
    .title {
        align-self: flex-start;
        padding: 10px;
        /* background-color: var(--theme_color_1);
    color: var(--theme_color_2); */
        color: var(--theme_color_7);
        background-color: var(--theme_color_4);
        border-radius: 5px;
        border: 1px solid var(--theme_color_7);
        cursor: pointer;
    }

    .open .title {
        border-bottom: none;
    }

    .list {
        width: 100%;
        margin: 0;
        padding: 10px;
        display: flex;
        flex-direction: column;
        background-color: var(--theme_color_4);
        border: 1px solid var(--theme_color_7);
        border-radius: 5px;
        margin-block-start: auto;
        margin-block-end: auto;
        margin-inline-end: auto;
        margin-inline-start: auto;
    }
    .setting {
        justify-content: space-between;
    }

    .key {
        display: flex;
        margin: 0;
    }

    .value {
        display: flex;
        margin-left: 10px;
        font-family: monospace;
    }
</style>

<div class="wrap" class:open={displayList}>
    {#if title}
        <div class="title" on:click={toggleDisplay}>{title}</div>
    {/if}
    {#if displayList}
        <dl class="list" transition:slide|local={{ y: -50, duration: 250 }}>
            {#each Object.entries(formattedSettings) as [name, value]}
                <div class="setting">
                    <dt class="key">{name}</dt>
                    <dd class="value">{value}</dd>
                </div>
            {/each}
        </dl>
    {/if}
</div>
