self.addEventListener("notificationclick",e=>{
 let d=e.notification.data;
 e.notification.close();

 let type = (e.action==="take")?"taken":"skipped";
 self.clients.matchAll().then(cl=>{
   cl.forEach(c=>c.postMessage({type:type,name:d.name,time:d.time}));
 });

 if(e.action==="skip"){
   self.registration.showNotification("Reminder continues",{
     body:`You skipped ${d.name}. You will be reminded again.`,
     icon:"data:image/jpeg;base64,/9j/4AAQSk..."
   });
 }
});
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
