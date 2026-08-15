const pinEl=document.getElementById('pin');
const pinInputEl=document.getElementById('pinInput');
const msgEl=document.getElementById('msg');
const enterEl=document.getElementById('enter');
const musicEl=document.getElementById('music');
const fallbackEl=document.getElementById('fallback');
const spotifyEl=document.getElementById('spotify');

let ctl=null,wants=false,started=false;

window.onSpotifyIframeApiReady=(IFrameAPI)=>{
  if(!spotifyEl)return;
  IFrameAPI.createController(spotifyEl,{width:'100%',height:'152',uri:'spotify:track:6OKmGZASRCmiKQKz4hCNrs'},controller=>{
    ctl=controller;
    controller.addListener('playback_started',()=>{
      started=true;
      if(fallbackEl)fallbackEl.style.display='none';
    });
    if(wants){try{controller.play();}catch(e){}}
  });
};

function musicOn(){
  wants=true;
  if(musicEl)musicEl.classList.add('show');
  if(ctl){try{ctl.play();}catch(e){}}
  setTimeout(()=>{
    if(!started&&fallbackEl)fallbackEl.style.display='block';
  },1600);
}

if(fallbackEl){
  fallbackEl.addEventListener('click',()=>{
    if(ctl){try{ctl.play();}catch(e){}}
  });
}

function unlock(){
  if(!pinInputEl||!pinEl)return;
  const value=pinInputEl.value.trim();
  if(value==='0000'){
    pinEl.classList.add('hidden');
    document.body.classList.remove('locked');
    if(msgEl)msgEl.textContent='';
    try{musicOn();}catch(e){console.warn('Audio no disponible todavía',e);}
  }else{
    if(msgEl)msgEl.textContent='Ese PIN no es.';
    pinInputEl.value='';
    pinInputEl.focus();
  }
}

if(enterEl)enterEl.addEventListener('click',unlock);
if(pinInputEl)pinInputEl.addEventListener('keydown',e=>{if(e.key==='Enter')unlock();});
