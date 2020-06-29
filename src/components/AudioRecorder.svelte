<script>
    import AudioClip from './AudioClip.svelte'

    const record = document.querySelector('.record')
    const stop = document.querySelector('.stop')
    const soundClips = document.querySelector('.sound-clips')
    const canvas = document.querySelector('.visualizer')
    const mainSection = document.querySelector('.main-controls')

    let clipSource = ''
    let clipName = ''

    // disable stop button while not recording

    stop.disabled = true

    function startClipRecording(e) {
        let record = e.target
        mediaRecorder.start()
        console.log(mediaRecorder.state)
        console.log('recorder started')
        record.style.background = 'red'
        stop.disabled = false
        record.disabled = true
    }

    function stopClipRecording() {
        mediaRecorder.stop()
        console.log(mediaRecorder.state)
        console.log('recorder stopped')
        record.style.background = ''
        record.style.color = ''
        // mediaRecorder.requestData();

        stop.disabled = true
        record.disabled = false
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
        chunks.push(e.data)
    }

    function mediaRecorderOnStop(e) {
        console.log('data available after MediaRecorder.stop() called.')

        clipName = getClipName()
        audio.controls = true
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' })
        chunks = []
        const audioURL = window.URL.createObjectURL(blob)
        clipSource = audioURL
        console.log('recorder stopped')
    }

    function onMediaSuccess(stream) {
        gotStream(stream)
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    }

    function onMediaError(err) {
        console.log('The following error occured: ' + err)
    }
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
        margin: 10px;
    }
    #buttons {
        margin: 10px;
    }
    #buttons button {
        background-color: white;
        margin: 0 10px;
        font-size: var(--theme_font_size_4);
    }
</style>

<section class="audio-recorder">
    <div id="buttons">
        <button class="record" on:click={startClipRecording}>&#9210;</button>
        <button class="stop" on:click={stopClipRecording}>&#9209;</button>
    </div>
</section>
<section class="audio-clips">
    {#if clipSource}
        <AudioClip
            source={clipSource}
            name={clipName}
            renameFn={renameClip}
            deleteFn={deleteClip} />
    {/if}
</section>
