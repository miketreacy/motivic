<script>
    export let source = ''
    export let name = ''
    export let renameFn = Function.prototype
    export let deleteFn = Function.prototype
</script>

<style>
    article {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        margin: 0;
        border: 1px dashed;
    }
    button {
        max-width: 50px;
    }
    audio {
        margin: 10px 0;
    }
</style>

<article class="clip">
    <div class="clip-label" on:click={renameFn}>{name}</div>
    <audio controls="true" src={source} />
    <button class="delete" on:click={deleteFn}>delete</button>
</article>
