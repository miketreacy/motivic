<script>
    import { onMount } from 'svelte'
    export let canvasCtx
    export let audioCtx
    export let audioStream

    let canvas
    let wrapper

    function canvasResize() {
        canvas.width = wrapper.offsetWidth
    }

    function visualize(stream) {
        if (!audioStream) {
            return
        }
        if (!audioCtx) {
            audioCtx = new AudioContext()
        }

        const source = audioCtx.createMediaStreamSource(stream)
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 2048
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        source.connect(analyser)
        //analyser.connect(audioCtx.destination);

        draw()

        function draw() {
            const WIDTH = canvas.width
            const HEIGHT = canvas.height

            requestAnimationFrame(draw)

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

    onMount(() => {
        canvasCtx = canvas.getContext('2d')
        canvasResize()
        let frame

        return () => {
            cancelAnimationFrame(frame)
        }
    })

    $: visualize(audioStream)
</script>

<style>
    section {
        padding: 10px;
        margin: 10px;
    }
</style>

<svelte:window on:resize={canvasResize} />
<section bind:this={wrapper}>
    <canvas bind:this={canvas} class="visualizer" height="200px" />
</section>
