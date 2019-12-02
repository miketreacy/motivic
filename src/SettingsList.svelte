<section id="settings" class="sidebar settings">
        <section class="section sidebar show setting-controls">
            <div class="controls setting-actions" data-action="multi">
                <button class="midi" autocomplete="off"><span>&#8681;</span><span>MIDI</span></button>
                <button class="json" autocomplete="off"><span>&#8681;</span><span>JSON</span></button>
                <!--Hiding cloud save for now until CRUD service is live-->
                <!--<button class="save"><span>&#9729;</span><span>save</span></button>-->
            </div>
        </section>
        <section class="section sidebar show">
            <h2>My Settings</h2>
            <div class="select-all">
                <input type="checkbox" id="select-all" data-action="multi" value="off"/>
                <label for="select-all">select all</label>
            </div>
            <ol class="item-list" data-type="settings"></ol>
        </section>
    </section>