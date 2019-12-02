<!--TODO: split this out into one universal motif-play-control section (play, loop, voice)-->
<!--TODO: and one universal motif crud section (local save, )-->
<!--TODO: this section defines what you can do with a newly-created motif (note-grid, randomize, upload)-->
<section id="input-controls" class="motif-controls">
        <!--TODO: convert this to a <fieldset> so I can disable them all at once-->
        <div class="controls motif-actions" data-action="single">
            <label class="hide" for="voice">Voice</label>
            <select class="voice" id="voice"></select>
            <button class="play"><span>&#9658;</span><span>play</span></button>
            <button class="loop"><span>&infin;</span><span>loop</span></button>
            <button class="save"><span>&#9745;</span><span>save</span></button>
        </div>
</section>