import App from './App.svelte';
import Utils from './utils'
const views = ["about", "studio", "motifs"];

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


//TODO: compute initial app state based on url path, localStorage, etc.
window.addEventListener('popstate', popState, false);
let [view, query, queryMap, pagination] = parseURL();
console.log(`parsed URL: view = ${view}`);

const app = new App({
	target: document.body,
	props: {
		view
	}
});

export default app;