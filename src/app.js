import MotivicUtils from './MotivicUtils.js'
import App from './components/App.svelte'
import { motifStore, settingStore } from './stores/Item'
const views = ['home', 'about', 'motifs', 'feedback', 'audio']
const homeSections = [
    'randomizer',
    'transformer',
    'uploader',
    'motif',
    'motifs',
    'settings',
    'audio',
]
let view = 'home'
let urlQueryMap = {}
let openSection = ''

/**
 * Parses URL to loads appropriate view.
 * Allows for sharable links.
 */
function parseURL() {
    let url = MotivicUtils.url.get(window)
    let hash = url.hash.split('#')[1] || ''
    let [view, query = ''] = hash.split('?')
    view = view || views[0]
    let queryProperties = query ? query.split('&') : []
    let queryMap = queryProperties.reduce((map, query) => {
        let [k, v] = query.split('=')
        map[k] = decodeURIComponent(v)
        return map
    }, {})
    let pagination = null

    if (view && views.includes(view)) {
        let currentPage = queryMap.page ? parseInt(queryMap.page) : 1
        // Commenting out now for Launch MVP
        // let pagination = getPagination(view, currentPage);
    }
    return [view, query, queryMap, pagination]
}
/**
 * Fixes the back button
 * @param {Event} e PopState event
 */
function popState(e) {
    const state = e.state
    console.info(`History State:`)
    console.table(state)
    parseURL()
}
// TODO: move this to App.svelte to update URL when view changes?
function updateURL(view = '', query = '', stateMap = {}, pagination = null) {
    let newURL = MotivicUtils.url.get(window)
    newURL.hash = query ? `${view}?${query}` : `${view}`
    stateMap.view = view
    MotivicUtils.url.create(window, {
        state: stateMap,
        title: document.querySelector('title').textContent,
        url: newURL,
    })
}

function init() {
    try {
        MotivicUtils.storage.init.bind(MotivicUtils.storage)()
    } catch (e) {
        console.error(e)
    }
    let localData = MotivicUtils.userData.init.bind(MotivicUtils.userData)()
    localData.motifs.forEach((m) => motifStore.add(m))
    localData.settings.forEach((s) => settingStore.add(s))
    // Commenting out for now since I'm not doing any url-based routing
    let [urlView, query, queryMap, pagination] = parseURL()
    console.info(`urlView: ${urlView} query: ${query} `)
    if (homeSections.includes(urlView)) {
        openSection = urlView
        view = views[0]
    } else {
        openSection = ''
        view = views[0]
    }

    urlQueryMap = queryMap
    window.addEventListener('popstate', popState, false)
}

init()
const app = new App({
    target: document.body,
    props: {
        view,
        urlQueryMap,
        openSection,
    },
})

export default app
