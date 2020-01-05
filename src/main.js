import App from './App.svelte';
import Utils from './Utils'
import { motifStore, settingStore } from './Stores.js';
const views = ["about", "studio", "motifs"];
let view = "studio";

/**
* Parses URL to loads appropriate view.
* Allows for sharable links.
*/
function parseURL() {
	let url = Utils.url.get(window);
	let hash = url.hash.split('#')[1] || '';
	let [view, query = ''] = hash.split('?');
	view = view || views[1];
	let queryProperties = query ? query.split("&") : [];
	let queryMap = queryProperties.reduce((map, query) => {
		let [k, v] = query.split("=");
		map[k] = v;
		return map;
	}, {});

	if (view && views.includes(view)) {
		let currentPage = queryMap.page ? parseInt(queryMap.page) : 1;
		// Commenting out now for Launch MVP
		// let pagination = getPagination(view, currentPage);
		let pagination = null;
		return [view, query, queryMap, pagination]
	}
}
/**
* Fixes the back button
* @param {Event} e PopState event
*/
function popState(e) {
	const state = e.state;
	console.info(`History State:`);
	console.table(state);
	parseURL();
}
// TODO: move this to App.svelte to update URL when view changes?
function updateURL(view = '', query = '', stateMap = {}, pagination = null) {
	let newURL = Utils.utils.get(window);
	newURL.hash = query ? `${view}?${query}` : `${view}`;
	stateMap.view = view;
	Utils.url.create(
		window,
		{
			//TODO: add more local state e.g. form state, grid state, etc.
			state: stateMap,
			title: document.querySelector('title').textContent,
			url: newURL
		});
}

function init() {
	Utils.storage.init.bind(Utils.storage)();
	let localData = Utils.userData.init.bind(Utils.userData)();
	localData.motifs.forEach(m => motifStore.add(m));
	localData.settings.forEach(s => settingStore.add(s));
	let [urlView, query, queryMap, pagination] = parseURL();
	view = urlView;
	console.log(`parsed URL: view = ${view}`);
	window.addEventListener('popstate', popState, false);
}

init();
const app = new App({
	target: document.body,
	props: {
		view
	}
});

export default app;