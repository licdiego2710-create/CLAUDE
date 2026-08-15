let db;
const fileEl=document.getElementById('file');
const captionEl=document.getElementById('caption');
const previewEl=document.getElementById('preview');
const addedEl=document.getElementById('added');
const saveEl=document.getElementById('save');

function openDB(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('AD16M',1);
    request.onupgradeneeded=()=>{
      if(!request.result.objectStoreNames.contains('photos')){
        request.result.createObjectStore('photos',{keyPath:'id'});
      }
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}
function data(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}
function all(){
  return new Promise((resolve,reject)=>{
    const request=db.transaction('photos','readonly').objectStore('photos').getAll();
    request.onsuccess=()=>resolve(request.result.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)));
    request.onerror=()=>reject(request.error);
  });
}
async function draw(){
  if(!db||!addedEl)return;
  const items=await all();
  addedEl.innerHTML=items.map(x=>`<figure class="card"><img src="${x.img}" style="width:100%;display:block" alt="${x.cap||'Recuerdo'}"><figcaption>${x.cap||'Un recuerdo más'}</figcaption></figure>`).join('');
}
if(fileEl){
  fileEl.addEventListener('change',async()=>{
    if(fileEl.files&&fileEl.files[0]&&previewEl){previewEl.innerHTML=`<img src="${await data(fileEl.files[0])}" alt="Vista previa">`;}
  });
}
if(saveEl){
  saveEl.addEventListener('click',async()=>{
    if(!db)return alert('El álbum todavía está cargando. Intenta de nuevo.');
    if(!fileEl||!fileEl.files||!fileEl.files[0])return alert('Elige una foto');
    const tx=db.transaction('photos','readwrite');
    tx.objectStore('photos').put({id:crypto.randomUUID(),img:await data(fileEl.files[0]),cap:captionEl?captionEl.value:'',createdAt:Date.now()});
    tx.oncomplete=()=>{
      fileEl.value='';
      if(captionEl)captionEl.value='';
      if(previewEl)previewEl.textContent='Vista previa';
      draw();
    };
  });
}
openDB().then(database=>{db=database;draw();}).catch(console.error);
