import App from './App.svelte';
const views = ["about", "studio", "motifs"];


const urlUtils = {
	get: win => new URL(win.location.href),
	/**
	 * Create new history entry.
	 * @param {Window} win Fresh instance of Window.
	 * @param {Object} opts Params map.
	 * @param {Object} [opts.state] Data to associate with url.
	 * @param {string} [opts.title] Title to associate with url.
	 * @param {string} [opts.url] New url.
	 */
	create: function (win, opts) {
		let state = opts.state || null;
		let title = opts.title || document.querySelector('title').textContent;
		let url = opts.url || win.location.href;

		win.history.pushState(state, title, url);
	},
	/**
	 * Update current history entry.
	 * @param {Window} win Fresh instance of Window.
	 * @param {Object} opts Params map.
	 * @param {Object} [opts.state] Data to associate with url.
	 * @param {string} [opts.title] Title to associate with url.
	 * @param {string} [opts.url] New url.
	 */
	update: function (win, opts) {
		let state = opts.state || null;
		let title = opts.title || document.querySelector('title').textContent;
		let url = opts.url || win.location.href;

		win.history.replaceState(state, title, url);
	}
};


/**
* Parses URL to loads appropriate view.
* Allows for sharable links.
*/
function parseURL() {
	let url = urlUtils.get(window);
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
function updateURL() {
	urlUtils.create(
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