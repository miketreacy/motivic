import App from './App.svelte';


//TODO: compute initial app state based on url path, localStorage, etc.
const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;