<script>

</script>

<style>

</style>

<!--TODO: split this out into one universal motif-play-control section (play, loop, voice)-->
<!--TODO: and one universal motif crud section (local save, )-->
<!--TODO: this section defines what you can do with a newly-created motif (note-grid, randomize, upload)-->
<section id="input-controls" class="motif-controls">
  <!--TODO: convert this to a <fieldset> so I can disable them all at once-->
  <div class="controls motif-actions" data-action="single">
    <label class="hide" for="voice">Voice</label>
    <select class="voice" id="voice" />
    <button class="play">
      <span>&#9658;</span>
      <span>play</span>
    </button>
    <button class="loop">
      <span>&infin;</span>
      <span>loop</span>
    </button>
    <button class="save" data-save="local">
      <span>&#9745;</span>
      <span>save</span>
    </button>
    <button class="save" data-save="cloud">
      <span>&#9729;</span>
      <span>save</span>
    </button>
    <button class="delete">
      <span>&#9747;</span>
      <span>delete</span>
    </button>
    <button class="midi">
      <span>&#8681;</span>
      <span>MIDI</span>
    </button>
    <button class="json">
      <span>&#8681;</span>
      <span>JSON</span>
    </button>
  </div>
</section>
