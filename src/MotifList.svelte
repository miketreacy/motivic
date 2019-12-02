<section id="motifs" class="sidebar motifs">
        <section class="section sidebar show motif-controls">
            <div class="controls motif-actions" data-action="multi">
                <button class="play" autocomplete="off"><span>&#9658;</span><span>play</span></button>
                <button class="loop" autocomplete="off"><span>&infin;</span><span>loop</span></button>
                <button class="delete" autocomplete="off"><span>&#9747;</span><span>delete</span></button>
                <button class="midi" autocomplete="off"><span>&#8681;</span><span>MIDI</span></button>
                <button class="json" autocomplete="off"><span>&#8681;</span><span>JSON</span></button>
                <!--Hiding cloud save for now until CRUD service is live-->
                <!--<button class="save"><span>&#9729;</span><span>save</span></button>-->
            </div>
        </section>
        <section class="section sidebar show" id="theme">
            <h2>My Motifs</h2>
            <div class="select-all">
                <input type="checkbox" id="select-all" data-action="multi" value="off"/>
                <label for="select-all">select all</label>
            </div>
            <!--Disabling pagination feature for Launch MVP-->
            <!--<div id="pagination">-->
                <!--<div id="page-display"></div>-->
                <!--<button id="page-first" data-page="1"><<</button>-->
                <!--<button id="page-back" data-page><</button>-->
                <!--<button id="page-forward" data-page>></button>-->
                <!--<button id="page-last" data-page>>></button>-->
            <!--</div>-->
            <ol class="motif-list item-list" data-type="motifs"></ol>
        </section>
    </section>