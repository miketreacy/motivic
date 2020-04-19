<script>
    const icon = {
        pageFirst: '<<<',
        pageLast: '<<<',
        pageBack: '<',
        pageForward: '>'
    }
</script>

<style>

</style>

<!-- Disabling pagination feature for Launch MVP -->
<div id="pagination">
    <div id="page-display" />
    <button id="page-first" data-page="1">{icon.pageFirst}</button>
    <button id="page-back" data-page>{icon.pageBack}</button>
    <button id="page-forward" data-page>{icon.pageForward}</button>
    <button id="page-last" data-page>{icon.pageLast}/button></button>
</div>
