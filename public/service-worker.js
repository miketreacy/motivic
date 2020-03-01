self.addEventListener("install", event => {
  console.log("Inside the install handler:", event);
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  console.log("Inside the activate handler:", event);
  return self.clients.claim();
});

self.addEventListener(fetch, event => {
  console.log("Inside the fetch handler:", event);
  event.respondWith(fetch(event.request));
});
