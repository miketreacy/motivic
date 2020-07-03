<script>
    export let source = ''
    export let name = ''
    export let renameFn = Function.prototype
    export let deleteFn = Function.prototype
</script>

<style>
    article {
        padding: 10px;
        margin: 5px;
    }
    button {
        background-color: white;
        margin: 0 10px;
        font-size: var(--theme_font_size_4);
    }
</style>

<article class="clip">
    <audio controls="true" src={source} />
    <div class="clip-label" on:click={renameFn}>{name}</div>
    <button class="delete" on:click={deleteFn}>delete clip</button>
</article>
