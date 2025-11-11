let meds = JSON.parse(localStorage.getItem("meds")||"[]");
let history = JSON.parse(localStorage.getItem("history")||"[]");
let spam = {};

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
Notification.requestPermission();

// UI load
const list = document.getElementById("list");
function render(){
  list.innerHTML = meds.map((m,i) => 
    `<li>${m.name} @ ${m.time} <button onclick="del(${i})">X</button></li>`
  ).join("");
}
render();

// add medicine
function addMed(){
  const name = med.value.trim(), t=time.value;
  if(!name||!t) return alert("Enter medicine & time");
  meds.push({name, time:t});
  localStorage.setItem("meds",JSON.stringify(meds));
  render();
  schedule({name,time:t});
  med.value="";time.value="";
}

// delete
function del(i){
 meds.splice(i,1);
 localStorage.setItem("meds",JSON.stringify(meds));
 render();
}

// schedule
function schedule(m){
  const now=new Date(), [h,mm]=m.time.split(":");
  const at=new Date(); at.setHours(h,mm,0,0);
  if(at<now) at.setDate(at.getDate()+1);
  setTimeout(()=> notify(m), at-now);
}

function notify(m){
 navigator.serviceWorker.ready.then(r=>{
   r.showNotification("Medicine Reminder",{
     body:`Take ${m.name}`,
     icon:"data:image/jpeg;base64,/9j/4AAQSk...",
     actions:[
       {action:"take",title:"✅ Taken"},
       {action:"skip",title:"⏰ Skip"}
     ],
     data:m
   });
 });
}

// listen SW
navigator.serviceWorker.onmessage = e=>{
 const {type,name,time}=e.data;

 // record
 history.push({name,time,status:type});
 localStorage.setItem("history",JSON.stringify(history));

 if(type==="take"){
   clearInterval(spam[name]); delete spam[name];
 }

 if(type==="skip"){
   spam[name]=setInterval(()=>notify({name,time}),300000);
 }
};

// reschedule after refresh
meds.forEach(schedule);
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install button
  document.getElementById('install-btn').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', () => {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    deferredPrompt = null;
  });
});
