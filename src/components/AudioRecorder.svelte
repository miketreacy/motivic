<script>
    import AudioClip from './AudioClip.svelte'
    import { onMount } from 'svelte'
    export let AudioSession = { ctx: null, stream: null }

    let isRecording = false
    let mediaRecorder = getMediaRecorder(AudioSession.stream)
    let audioChunks = []
    let clipSource = ''
    let clipName = ''

    function startClipRecording(e) {
        toggleRecordingState()
        console.log(mediaRecorder.state)
        console.log('recorder started')
    }

    function stopClipRecording() {
        toggleRecordingState()
        console.log(mediaRecorder.state)
        console.log('recorder stopped')
        // mediaRecorder.requestData();
    }

    function getClipName() {
        return window.prompt(
            'Enter a name for your sound clip?',
            'My unnamed clip'
        )
    }

    function renameClip(e) {
        const existingName = e.target.textContent
        const newClipName = getClipName()
        if (newClipName === null) {
            clipName = existingName
        } else {
            clipName = newClipName
        }
    }

    function deleteClip(e) {
        clipName = ''
    }

    function mediaRecorderOnDataAvailable(e) {
        audioChunks.push(e.data)
    }

    function mediaRecorderOnStop(e) {
        clipName = getClipName()
        const blob = new Blob(audioChunks, { type: 'audio/ogg; codecs=opus' })
        audioChunks = []
        clipSource = window.URL.createObjectURL(blob)
    }

    function getMediaRecorder(stream) {
        let recorder = stream
            ? new MediaRecorder(stream, {
                  mimeType: 'audio/webm'
              })
            : null

        if (recorder) {
            recorder.ondataavailable = mediaRecorderOnDataAvailable
            recorder.onstop = mediaRecorderOnStop
        }
        return recorder
    }

    function toggleRecordingState() {
        isRecording = !isRecording
    }

    function toggleRecorder(recording = false) {
        if (recording) {
            mediaRecorder.start()
        } else {
            if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop()
            }
        }
    }

    $: toggleRecorder(isRecording)
    $: mediaRecorder = getMediaRecorder(AudioSession.stream)
</script>

<style>
    a {
        display: flex;
        flex-direction: column;
        cursor: pointer;
        color: var(--theme_color_2);
        font-size: var(--theme_font_size_2);
        background-color: var(--theme_color_1);
        border: none;
        border-radius: 5px;
        min-height: 30px;
        outline: none;
        padding: 5px;
        height: var(--touch_min_height);
        box-sizing: border-box;
        width: 40px;
        margin: 0 10px;
    }
    section {
        padding: 10px;
        margin: 5px;
    }
    .buttons {
        width: 100%;
        justify-content: space-evenly;
    }

    button {
        padding: 0;
        font-size: var(--theme_font_size_4b);
        flex: 1 1 0;
        background: none;
        max-width: 50px;
    }
</style>

{#if mediaRecorder}
    <section class="audio-recorder">
        <div class="buttons">
            <button
                class="record"
                on:click={startClipRecording}
                disabled={isRecording}>
                &#9210;
            </button>
            <button
                class="stop"
                on:click={stopClipRecording}
                disabled={!isRecording}>
                &#9209;
            </button>
        </div>
    </section>
{/if}
<section class="audio-clips">
    {#if clipSource}
        <AudioClip
            source={clipSource}
            name={clipName}
            renameFn={renameClip}
            deleteFn={deleteClip} />
    {/if}
</section>
