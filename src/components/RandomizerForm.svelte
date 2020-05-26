<script>
    import { createEventDispatcher } from 'svelte'
    import { randomizer } from '../stores/FormState'
    import MotifForm from './MotifForm.svelte'
    import Config from '../Config'
    import MotivicUtils from '../MotivicUtils'

    export let formOpen = false
    export let motifs = []
    export let scrollDown = false

    const {
        notes,
        modes,
        timeSignatureBeats,
        timeSignatureUnits,
        noteDurations
    } = Config
    const formId = 'randomizer'
    const formTitle = 'Randomizer'
    const formInfo =
        'generates a random monophonic melody based on user settings'
    const formCanSubmitDefault = true

    let newMotif = null
    const leapRangeConfig = {
        min: { min: 0, max: 11 },
        max: { min: 2, max: 48 }
    }
    // some state is local to this form and updated in stateFilterFn()
    const submitOptions = Config.api.operations.randomizer
    const dispatch = createEventDispatcher()

    let rowLayout = ''

    function getLeapRange(lowOctave, highOctave) {
        let minNoteVal = MotivicUtils.melody.getNoteValue('c', lowOctave)
        let maxNoteVal = MotivicUtils.melody.getNoteValue('b', highOctave)
        let noteValRange = maxNoteVal - minNoteVal + 1
        let maxMax = Math.min(leapRangeConfig.max.max, noteValRange - 1)
        let minMax = Math.min(leapRangeConfig.min.max, maxMax - 6)
        let range = {
            min: { min: 0, max: minMax },
            max: { min: minMax + 2, max: maxMax }
        }
        return range
    }

    function getFieldRows(state) {
        let leapRange = getLeapRange(state.octave_low, state.octave_high)
        return [
            [
                {
                    type: 'select',
                    id: 'key',
                    label: 'key',
                    value: state.key,
                    options: notes,
                    info: 'The tonic of the melody'
                },
                {
                    type: 'select',
                    id: 'mode',
                    label: 'mode',
                    value: state.mode,
                    options: Object.keys(modes),
                    info: 'The sequence of intervals that comprise the scale'
                }
            ],
            [
                {
                    type: 'number',
                    id: 'octave_low',
                    label: 'low octave',
                    value: state.octave_low,
                    step: 1,
                    min: 0,
                    max: 8,
                    info: 'Uses piano octaves (Scientific Pitch Notation)',
                    rowLayout
                },
                {
                    type: 'number',
                    id: 'octave_high',
                    label: 'high octave',
                    value: state.octave_high,
                    step: 1,
                    min: 0,
                    max: 8,
                    info: 'Uses piano octaves (Scientific Pitch Notation)',
                    rowLayout
                }
            ],
            [
                {
                    type: 'number',
                    id: 'leap_min',
                    label: 'min leap',
                    value: state.leap_min,
                    step: 1,
                    min: leapRange.min.min,
                    max: leapRange.min.max,
                    info:
                        'Minimum leap (in half-steps) between two consecutive notes',
                    rowLayout
                },
                {
                    type: 'number',
                    id: 'leap_max',
                    label: 'max leap',
                    value: leapRange.max.max,
                    step: 1,
                    min: leapRange.max.min,
                    max: leapRange.max.max,
                    info:
                        'Maximum leap (in half-steps) between two consecutive notes',
                    rowLayout
                }
            ],
            [
                {
                    type: 'select',
                    id: 'duration_min',
                    label: 'min note duration',
                    value: state.duration_min,
                    options: noteDurations,
                    info: 'Minimum note length',
                    rowLayout
                },
                {
                    type: 'select',
                    id: 'duration_max',
                    label: 'max note duration',
                    value: state.duration_max,
                    options: noteDurations,
                    info: 'Maximum note length',
                    rowLayout
                }
            ],
            [
                {
                    type: 'select',
                    id: 'timeSignature_beat_0',
                    label: 'time signature beat',
                    value: state.timeSignature_beat_0,
                    options: timeSignatureBeats,
                    info: 'Beats per measure',
                    rowLayout
                },
                {
                    type: 'select',
                    id: 'timeSignature_unit_1',
                    label: 'time signature unit',
                    value: state.timeSignature_unit_1,
                    options: timeSignatureUnits,
                    info:
                        'Which note duration gets one beat (4 = quarter note, etc)',
                    rowLayout
                }
            ],
            [
                {
                    type: 'hidden',
                    id: 'tempo_type',
                    value: 'bpm'
                },
                {
                    type: 'number',
                    id: 'tempo_units',
                    label: 'tempo(bpm)',
                    value: state.tempo_units,
                    step: 1,
                    min: 60,
                    max: 240,
                    roughIncrement: 10
                }
            ],
            [
                {
                    type: 'hidden',
                    id: 'length_type',
                    value: 'measures'
                },
                {
                    type: 'number',
                    id: 'length_units',
                    label: 'measures',
                    value: state.length_units,
                    step: 1,
                    min: 1,
                    max: 8
                }
            ]
        ]
    }

    function getRequestBodyFn(state) {
        let reqBody = {}
        for (let [key, value] of Object.entries(state)) {
            console.log(`${key}: ${value}`)
            let [propMap, propKey, valIdx] = key.split('_')
            if (propKey) {
                let idx = parseInt(valIdx)
                if (!Number.isNaN(idx)) {
                    // is array prop
                    reqBody[propMap] = reqBody[propMap] || []
                    reqBody[propMap][idx] = value
                } else {
                    // is nested object prop
                    reqBody[propMap] = reqBody[propMap] || {}
                    reqBody[propMap][propKey] = value
                }
            } else {
                // is primitive prop
                reqBody[key] = value
            }
        }
        return reqBody
    }

    function responseCallbackFn(data) {
        const motif = data && data.response ? data.response : null
        console.info(`SUCCESS response from ${formId.toUpperCase()} API`)
        console.dir(motif)
        let [success, msg, createdMotif] = MotivicUtils.userData.processNewItem(
            motif,
            'motifs',
            'my motif'
        )
        dispatch('displayAlert', {
            visible: true,
            type: success ? 'success' : 'error',
            message: success ? `New random motif created!` : msg,
            displayTimeMs: 1000,
            dismissable: false,
            top: 58
        })
        newMotif = createdMotif
    }

    let staticProps = {
        formId,
        formTitle,
        formInfo,
        responseCallbackFn,
        submitOptions,
        getRequestBodyFn,
        formCanSubmitDefault
    }
    $: fieldRows = getFieldRows($randomizer)
    $: selectedPresetId = $randomizer.preset_id
</script>

<style>

</style>

<MotifForm
    {...staticProps}
    stateUpdaterFn={randomizer.updateForm}
    state={$randomizer}
    {selectedPresetId}
    {fieldRows}
    {formOpen}
    {newMotif}
    {motifs}
    {scrollDown}
    stickyControls={true}
    on:displayToggle
    on:displayCrudModal
    on:displayAlert />
