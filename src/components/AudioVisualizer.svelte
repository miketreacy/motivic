<script>
    import { onMount } from 'svelte'
    export let AudioSession = { ctx: null, stream: null }

    let rafID = null
    let canvas
    let canvasCtx
    let wrapper

    function stopLoop() {
        return window.cancelAnimationFrame(rafID)
    }

    function canvasResize(canvas) {
        canvas.width = wrapper.offsetWidth
    }

    function visualize(audioCtx, stream, canvas) {
        if (!stream || !audioCtx || !canvas) {
            return
        }
        if (!AudioSession.ctx) {
            console.info(`no audioCtx!!!`)
            return false
        }

        const source = audioCtx.createMediaStreamSource(stream)
        let analyser = audioCtx.createAnalyser()
        analyser.fftSize = 2048
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        source.connect(analyser)
        let canvasCtx = canvas.getContext('2d')
        draw()

        function draw() {
            const WIDTH = canvas.width
            const HEIGHT = canvas.height

            rafID = window.requestAnimationFrame(draw)
            analyser.getByteTimeDomainData(dataArray)
            canvasCtx.fillStyle = 'rgb(200, 200, 200)'
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)
            canvasCtx.lineWidth = 2
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)'
            canvasCtx.beginPath()

            let sliceWidth = (WIDTH * 1.0) / bufferLength
            let x = 0

            for (let i = 0; i < bufferLength; i++) {
                let v = dataArray[i] / 128.0
                let y = (v * HEIGHT) / 2

                if (i === 0) {
                    canvasCtx.moveTo(x, y)
                } else {
                    canvasCtx.lineTo(x, y)
                }

                x += sliceWidth
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2)
            canvasCtx.stroke()
        }
    }

    function initStream(audioSession) {
        // Create an AudioNode from the stream.
        let mediaStreamSource = audioSession.ctx.createMediaStreamSource(
            audioSession.stream
        )

        // Connect it to the destination.
        analyser = audioSession.ctx.createAnalyser()
        analyser.fftSize = 2048
        mediaStreamSource.connect(analyser)
    }

    onMount(() => {
        canvasResize(canvas)
        if (AudioSession.ctx && AudioSession.stream && canvas) {
            visualize(AudioSession.ctx, AudioSession.stream, canvas)
        }
        return stopLoop
    })

    $: visualize(AudioSession.ctx, AudioSession.stream, canvas)
</script>

<style>
    section {
        padding: 10px;
        margin: 5px;
    }
</style>

<svelte:window on:resize={canvasResize} />
<section bind:this={wrapper}>
    <canvas bind:this={canvas} class="visualizer" height="200px" />
</section>
