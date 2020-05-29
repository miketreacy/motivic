<script>
    import { createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    import Config from '../Config'
    import MotivicUtils from '../MotivicUtils'
    import Field from './Field.svelte'
    import MotifFormHeader from './MotifFormHeader.svelte'
    import MotifFormControls from './MotifFormControls.svelte'
    import MotifAudition from './MotifAudition.svelte'
    import ItemSelector from './ItemSelector.svelte'
    export let formId
    export let formTitle
    export let formInfo
    export let state = {}
    export let stateUpdaterFn = Function.prototype
    export let fieldRows = []
    export let submitOptions = null
    export let responseCallbackFn = Function.prototype
    export let getRequestBodyFn = Function.prototype
    export let formCanSubmitDefault = false
    export let newMotif = null
    export let topControls = true
    export let formControls = ['reset', 'submit']
    export let formOpen = false
    export let motifs = []
    export let settings = []
    export let scrollDown = false
    export let stickyControls = false
    export let selectedSettingId = ''

    const dispatch = createEventDispatcher()
    const presets = Config.formPresets[formId] || []
    const apiUrl = submitOptions ? `/api/${submitOptions.path}` : ''
    let scrollPos
    // store initial values as defaults
    let defaultState = MotivicUtils.general.clone(
        Config.formDefaults.randomizer
    )
    let formInDefaultState = true
    let formInPresetState = false
    let formCanSubmit = true
    let loading = false
    const settingsSelectorTypes = [
        { type: 'preset', label: 'preset', items: presets },
        { type: 'user', label: 'my settings', items: settings }
    ]
    let settingsSelectorType = settingsSelectorTypes[0]
    let presetSelected = false

    function dispatchFormToggle(open) {
        dispatch('displayToggle', { section: formId, open: open })
    }

    function toggleFormFn() {
        dispatchFormToggle(!formOpen)
    }

    function isInDefaultState(state, stateDefault) {
        let diffKeys = []
        let result = true
        if (!(state && stateDefault)) {
            return result
        }
        Object.entries(state).forEach(([k, v]) => {
            if (k !== 'setting_id') {
                if (stateDefault[k] !== v) {
                    let diffKey = [k, stateDefault[k], v]
                    diffKeys.push(diffKey)
                }
            }
        })
        if (diffKeys.length) {
            let diffMsg = diffKeys
                .map(diff => `${diff[0]} was ${diff[1]}, is ${diff[2]}`)
                .join('\n')
            result = false
        }
        return result
    }

    function isInPresetState(state, presetStates) {
        return presetStates.some(presetState =>
            isInDefaultState(state, presetState)
        )
    }

    function canFormSubmit(inDefaultState, isSubmitting) {
        let result = true
        if (isSubmitting) {
            result = false
        }
        if (inDefaultState && !formCanSubmitDefault) {
            result = false
        }
        return result
    }

    function resetFormFn() {
        stateUpdaterFn(defaultState)
    }

    function getApiParams(payload) {
        let { method, mode, headers } = submitOptions
        return {
            method,
            body: JSON.stringify(payload),
            mode,
            headers
        }
    }

    async function submitFormFn() {
        newMotif = null
        loading = true
        scrollPos = 0
        const reqBody = getRequestBodyFn(state)
        // rollDice();
        // toggleLoader(doc.querySelector("#randomize .dice"), true);
        let [data, error] = await MotivicUtils.http.awaitFetchTimeout(
            apiUrl,
            getApiParams(reqBody),
            submitOptions.timeoutMilliseconds
        )
        if (data) {
            responseCallbackFn(data)
        } else {
            dispatch('displayAlert', {
                visible: true,
                type: 'error',
                message: `${formTitle} API operation failed.\n${error.message}`,
                displayTimeMs: 1500,
                dismissable: true,
                top: 45
            })
        }

        loading = false
    }

    function handleAuditionToggle(event) {
        newMotif = event.detail.motif
    }

    function getNewMotif(newMotif, motifs) {
        if (!newMotif) {
            return null
        }
        let match = motifs.find(m => m.id === newMotif.id)
        if (match && !match.saved.local) {
            return match
        } else {
            return null
        }
    }

    function getPresetState(presetId) {
        if (presetId) {
            let preset = presets.find(p => p.id === presetId)
            if (preset) {
                return preset.formState
            }
        }
        return null
    }

    function getSettingState(settingId) {
        if (settingId) {
            let setting = settings.find(s => s.id === settingId)
            if (setting) {
                return setting.formState
            }
        }
        return null
    }

    function handlePresetSelection(event) {
        selectedSettingId = event.detail.itemId
        let presetState = getPresetState(selectedSettingId)
        if (!presetState) {
            return
        }
        stateUpdaterFn(presetState)
    }

    function handleSettingSelection(event) {
        selectedSettingId = event.detail.itemId
        let isPreset = selectedSettingId.startsWith(Config.presetIdPrefix)
        let settingState = isPreset
            ? getPresetState(selectedSettingId)
            : getSettingState(selectedSettingId)
        if (!settingState) {
            return
        }
        stateUpdaterFn(settingState)
    }

    function toggleSettingsSelector() {
        settingsSelectorType =
            settingsSelectorType.type === 'preset'
                ? settingsSelectorTypes.find(t => t.type === 'user')
                : settingsSelectorTypes.find(t => t.type === 'preset')
    }

    function saveSetting(event) {
        console.info(`dispatchDisplayModal() called`)
        let setting = Object.assign(
            {
                id: MotivicUtils.general.randomString(),
                saved: { local: false, cloud: false },
                form: formId
            },
            state
        )
        let payload = {
            modalProps: {
                show: true,
                itemType: 'settings',
                item: setting,
                formType: event.target.dataset.action,
                actionComplete: false
            }
        }
        console.dir(payload)
        dispatch('displayCrudModal', payload)
    }

    $: {
        formInDefaultState = isInDefaultState(state, defaultState)
        formInPresetState = isInPresetState(
            state,
            presets.map(p => p.formState)
        )
        formCanSubmit = canFormSubmit(formInDefaultState, loading)
    }
    $: newMotif = getNewMotif(newMotif, motifs)
    $: presetSelected =
        settingsSelectorType.type === 'preset' &&
        selectedSettingId.startsWith(Config.presetIdPrefix)
</script>

<style>
    section {
        flex-direction: column;
    }
    section[data-closed='true'] {
        padding: 10px;
        justify-items: flex-start;
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
    }
    fieldset {
        border-style: solid;
        border: none;
        padding: 10px 5px;
        margin: 10px 0;
        width: 100%;
        flex-direction: column;
        background-color: var(--theme_color_5);
        border-radius: 5px;
    }

    .form-row {
        padding: 5px 10px;
        flex-direction: column;
        width: 100%;
    }

    .form-row.horizontal {
        flex-direction: row;
        justify-content: space-between;
    }

    .form-row:last-of-type {
        border-bottom: none;
    }
</style>

<svelte:window bind:scrollY={scrollPos} />
<section id={formId} data-closed={!formOpen}>

    <MotifFormHeader
        {formId}
        {formTitle}
        {formInfo}
        {formOpen}
        {toggleFormFn} />

    {#if formOpen}
        {#if topControls}
            <MotifFormControls
                {formOpen}
                {formInDefaultState}
                {toggleFormFn}
                {resetFormFn}
                {submitFormFn}
                {formCanSubmit}
                {scrollDown}
                sticky={stickyControls}
                {loading}
                controls={formControls} />
        {/if}
        {#if newMotif}
            <MotifAudition
                motif={newMotif}
                on:toggleMotifAudition={handleAuditionToggle}
                on:displayCrudModal
                on:displayAlert />
        {/if}
        <slot />
        {#if fieldRows.length}
            <fieldset class="user-input" in:fade>
                <legend>settings</legend>
                {#if !formInDefaultState && !formInPresetState}
                    <button
                        class="save-setting"
                        data-action="save"
                        on:click={saveSetting}>
                        save setting
                    </button>
                {/if}
                {#if presets.length}
                    <div class="form-row" class:horizontal={true}>
                        {#if settings.length}
                            <button on:click={toggleSettingsSelector}>
                                {settingsSelectorTypes.find(t => t.type !== settingsSelectorType.type).label}
                            </button>
                        {/if}
                        <ItemSelector
                            {formId}
                            items={settingsSelectorType.items}
                            itemType="settings"
                            label={settingsSelectorType.label}
                            selectedItemId={selectedSettingId}
                            formFieldLayout={true}
                            defaultSelection={{ id: 'preset-none', name: '--none--' }}
                            on:itemSelection={handleSettingSelection}
                            on:displayAlert />
                    </div>
                {/if}
                {#each fieldRows as fields}
                    <div
                        class="form-row"
                        class:horizontal={fields.some(f => f.rowLayout === 'horizontal')}>
                        {#each fields as field}
                            <Field
                                {...field}
                                updaterFn={stateUpdaterFn}
                                on:inputValueChange
                                on:displayAlert />
                        {/each}
                    </div>
                {/each}
            </fieldset>
        {/if}
    {/if}
    <!-- <section class="show selected-setting">
    <div class="input-wrap">
      <label for="select-setting">Selected Setting</label>
      <button id="select-setting-reset">clear</button>
      <select
        id="select-setting"
        name="selected-setting"
        data-default="new unnamed"
        data-action="single" />
    </div>
  </section> -->
    <MotifFormControls
        {formOpen}
        {formInDefaultState}
        {toggleFormFn}
        {resetFormFn}
        {submitFormFn}
        {formCanSubmit}
        {scrollDown}
        {loading}
        controls={formControls} />
</section>
