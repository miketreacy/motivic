<script>
    import { createEventDispatcher } from 'svelte'
    import Config from './Config.js'
    import Utils from './Utils'
    import MotifForm from './MotifForm.svelte'
    import ItemSelector from './ItemSelector.svelte'
    export let formOpen = false
    export let motif = null
    export let motifs = []
    export let selectedMotifId = ''
    export let scrollDown = false
    const formId = 'transformer'
    const formTitle = 'Transformer'
    const formInfo =
        'applies transformations to an existing monophonic melody to produce counterpoint'
    const formCanSubmitDefault = false
    let formState = {
        motif: null,
        transpose: 0,
        invert: false,
        reverse_rhythm_0: false,
        reverse_pitch_1: false,
        augment: 0,
        diminish: 0,
        stagger: 0
    }
    let newMotif = null
    const fieldRows = [
        [
            {
                type: 'number',
                id: 'transpose',
                label: 'transpose',
                value: 0,
                step: 1,
                min: -11,
                max: 11,
                info: 'Move the melody up or down in pitch'
            },
            {
                type: 'checkbox',
                id: 'invert',
                label: 'invert',
                value: false,
                info: 'Turn the melody upside-down'
            }
        ],
        [
            {
                type: 'checkbox',
                id: 'reverse_pitch_1',
                label: 'reverse pitches',
                value: false,
                info: "Turn the melody's pitches backwards"
            },
            {
                type: 'checkbox',
                id: 'reverse_rhythm_0',
                label: 'reverse durations',
                value: false,
                info: "Turn the melody's note durations backwards"
            }
        ],
        [
            {
                type: 'number',
                id: 'augment',
                label: 'augment',
                value: 0,
                step: 2,
                min: 0,
                max: 4,
                info: 'Increase the duration of notes by this factor'
            },
            {
                type: 'number',
                id: 'diminish',
                label: 'diminish',
                value: 0,
                step: 2,
                min: 0,
                max: 4,
                info: 'Reduce the duration of notes by this factor'
            },
            {
                type: 'number',
                id: 'stagger',
                label: 'stagger',
                value: 0,
                step: 1,
                min: 0,
                max: 64,
                info: 'Offset the start of the melody by this many 64th notes'
            }
        ],
        [
            {
                type: 'text',
                id: 'name',
                label: 'name',
                max: 16,
                apiField: false,
                info: 'The name of the new transformed motif'
            }
        ]
    ]

    const submitOptions = Config.api.operations.transformer
    const dispatch = createEventDispatcher()

    function responseCallbackFn(data) {
        const motif = data && data.response ? data.response : null
        console.info(`SUCCESS response from ${formId.toUpperCase()} API`)
        console.dir(motif)
        let { transformations, melody: parentMotif } = data.request.body
        // add the newly-created variation motif
        let nameEl = document.querySelector('#name')
        let [success, msg, savedVariationMotif] = Utils.userData.processNewItem(
            motif,
            'motifs',
            (nameEl && nameEl.value) || `${motif.name}_var_1`,
            '',
            parentMotif.id,
            transformations
        )

        dispatch('displayAlert', {
            visible: true,
            type: success ? 'success' : 'error',
            message: success ? 'New motif variation created!' : msg,
            displayTimeMs: 1000,
            dismissable: false,
            top: 55
        })
        newMotif = savedVariationMotif
    }

    function getTransformations(state) {
        let list = []
        for (let [key, value] of Object.entries(state)) {
            console.log(`${key}: ${value}`)
            if (value !== formState[key]) {
                let map = { type: key, params: [value] }
                if (typeof value === 'boolean') {
                    map.params = []
                }
                list.push(map)
            }
        }

        //TODO: refactor this hot mess 😰
        let reverseMaps = list.filter(
            map => map.type.split('_')[0] === 'reverse'
        )
        if (reverseMaps.length) {
            let thisMap = { type: 'reverse', params: [false, false] }
            reverseMaps.forEach(map => {
                let i = list.findIndex(el => el === map)
                let [, , valIdx] = map.type.split('_')
                list.splice(i, 1)
                thisMap.params[parseInt(valIdx)] = true
            })
            list.push(thisMap)
        }
        console.log(list)
        return list
    }

    function getRequestBodyFn(state) {
        return { melody: motif, transformations: getTransformations(state) }
    }

    function handleItemSelection(event) {
        selectedMotifId = event.detail.itemId
    }

    function selectMotif(motifId) {
        motif = motifs.find(m => m.id === motifId)
        return motif
    }

    let staticProps = {
        formId,
        formTitle,
        formInfo,
        formState,
        responseCallbackFn,
        submitOptions,
        getRequestBodyFn,
        formCanSubmitDefault
    }

    $: motif = selectMotif(selectedMotifId)
</script>

<style>

</style>

<MotifForm
    {...staticProps}
    {fieldRows}
    {formOpen}
    {newMotif}
    {motifs}
    {scrollDown}
    on:displayToggle
    on:displayCrudModal>
    {#if motifs.length}
        <ItemSelector
            {formId}
            items={motifs}
            itemType="motifs"
            selectedItemId={selectedMotifId}
            on:itemSelection={handleItemSelection}
            on:displayAlert />
    {/if}
</MotifForm>
