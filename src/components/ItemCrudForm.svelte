<script>
    import { onMount } from 'svelte'
    import { createEventDispatcher } from 'svelte'
    import MotivicUtils from '../MotivicUtils'
    export let item = null
    export let itemChildren = []
    export let itemType = ''
    export let submitCallback = Function.prototype
    export let actionComplete = false
    export let formType = ''

    const dispatch = createEventDispatcher()
    let timeoutId = ''
    let resultMessage = ''
    let renameItemValue = item.name || ''
    let actionSuccessful = true

    function displayAlert(success, msg) {
        dispatch('displayAlert', {
            visible: true,
            type: success ? 'success' : 'error',
            message: msg,
            displayTimeMs: 1500,
            dismissable: false
        })
    }

    function saveItem() {
        item.name = renameItemValue
        let [success, msg] = MotivicUtils.userData.persist(item, itemType, true)
        actionSuccessful = success
        resultMessage = msg
        // TODO: figure out why the call to displayAlert isn't working
        // displayAlert(actionSuccessful, msg)
        actionComplete = true
        if (success) {
            timeoutId = window.setTimeout(submitCallback, 2000)
        }
    }

    // update child variations to remove childId => parentId reference
    function updateChildren() {
        let successes = []
        let msgs = []
        itemChildren
            .map(item => {
                item.parentId = ''
                item.transformations = []
                return item
            })
            .forEach(item => {
                let [success, msg] = MotivicUtils.userData.persist(
                    item,
                    itemType
                )
                successes.push(success)
                msgs.push(msg)
            })
    }

    function deleteItem() {
        let [success, msg] = MotivicUtils.userData.remove(item, itemType)
        updateChildren()
        actionSuccessful = success
        resultMessage = msg
        // TODO: figure out why the call to displayAlert isn't working
        // displayAlert(actionSuccessful, msg)
        actionComplete = true
        if (success) {
            timeoutId = window.setTimeout(submitCallback, 2000)
        }
    }

    onMount(() => {
        console.info(`ItemCrudForm onMount() props`)
        console.dir($$props)
    })
</script>

<style>
    fieldset {
        background-color: var(--theme_color_5);
        padding: 10px;
        margin: 10px 0;
        width: 100%;
        border: none;
        border-radius: 5px;
        min-height: 190px;
    }
    .input-wrap {
        flex-direction: column;
        padding: 10px;
        align-content: center;
        line-height: 30px;
    }
    .msg {
        padding: 0;
    }

    label,
    input,
    p {
        flex: 1 1 0;
        text-align: center;
        line-height: 30px;
        min-height: auto;
        width: 100%;
        /* max-width: fit-content; */
    }
    .form-wrap {
        padding-top: 30px;
        widows: 100%;
        top: -25px;
        position: relative;
    }
    .submit {
        background-color: var(--theme_color_1);
        margin: 10px auto 0;
    }
    div[data-form-type='delete'] .submit {
        background-color: var(--theme_color_8);
    }

    #item-name {
        font-size: var(--theme_font_size_2);
    }

    .item-confirmation {
        align-items: flex-start;
    }
    .item-confirmation li {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-items: flex-start;
    }
    .item-confirmation li span {
        display: block;
        box-sizing: border-box;
    }
    .key {
        font-style: italic;
        padding-right: 5px;
    }
    .value {
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        max-width: 70vw;
        color: var(--theme_color_1);
    }
    .result-message {
        padding: 10px;
        text-align: left;
        white-space: pre-wrap;
        background-color: var(--theme_color_5);
    }
    [data-success='false'] {
        border: 2px solid var(--theme_color_8);
        box-sizing: border-box;
    }
</style>

{#if formType === 'save'}
    <div class="form-wrap">
        <h2>Save {MotivicUtils.general.singularize(itemType)}</h2>
        <fieldset>
            <div class="input-wrap name">
                <label for="item-name">name</label>
                <!-- svelte-ignore a11y-autofocus -->
                <input
                    type="text"
                    max="32"
                    class="name"
                    id="item-name"
                    bind:value={renameItemValue}
                    placeholder={`${MotivicUtils.general.singularize(itemType)} name`}
                    autofocus
                    on:click={e => e.target.select()} />
            </div>
            <button
                class="submit"
                disabled={actionComplete}
                on:click={saveItem}>
                submit
            </button>
        </fieldset>
        {#if actionComplete}
            <div class="result-message" data-success={actionSuccessful}>
                {resultMessage}
            </div>
        {/if}
    </div>
{/if}
{#if formType === 'rename'}
    <div class="form-wrap">
        <h2>Rename {MotivicUtils.general.singularize(itemType)}</h2>
        <fieldset>
            <div class="input-wrap name">
                <label for="item-name">name</label>
                <!-- svelte-ignore a11y-autofocus -->
                <input
                    type="text"
                    max="32"
                    class="name"
                    id="item-name"
                    bind:value={renameItemValue}
                    placeholder={`rename ${MotivicUtils.general.singularize(itemType)}`}
                    autofocus
                    on:click={e => e.target.select()} />
            </div>
            <button
                class="submit"
                disabled={actionComplete}
                on:click={saveItem}>
                submit
            </button>
        </fieldset>
        {#if actionComplete}
            <div class="result-message" data-success={actionSuccessful}>
                {resultMessage}
            </div>
        {/if}
    </div>
{/if}
{#if formType === 'delete'}
    <div class="form-wrap" data-form-type={formType}>
        <h2>Delete {MotivicUtils.general.singularize(itemType)}</h2>
        <fieldset>
            <div class="input-wrap msg">
                <p class="confirmation">
                    {`Do you really want to delete this ${MotivicUtils.general.singularize(itemType)}?`}
                </p>
                <div class="item">
                    <ul class="item-confirmation">
                        <li>
                            <span class="key">name:</span>
                            <span class="value">{item.name}</span>
                        </li>
                        <li>
                            <span class="key">id:</span>
                            <span class="value">{item.id}</span>
                        </li>
                        <li>
                            <span class="key">created:</span>
                            <span class="value">
                                {MotivicUtils.general.dateDisplay(new Date(item.created))}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
            <button
                class="submit"
                disabled={actionComplete}
                on:click={deleteItem}>
                delete
            </button>
        </fieldset>
        {#if actionComplete}
            <div class="result-message" data-success={actionSuccessful}>
                {resultMessage}
            </div>
        {/if}
    </div>
{/if}
