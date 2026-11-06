import { setupPrologue } from './prologue.js';
const palettes={1996:['#4d5948','77 89 72'],2001:['#665b46','102 91 70'],2003:['#805b3c','128 91 60'],2005:['#526b7a','82 107 122'],2008:['#526e79','82 110 121'],2012:['#9a4c29','154 76 41'],2016:['#605d54','96 93 84'],2017:['#605d54','96 93 84'],2021:['#856746','133 103 70'],2024:['#81504d','129 80 77'],2025:['#81504d','129 80 77']};
let activeEra=null;
export function showEra(m,albums,instant){
  const section=document.querySelector('.journey'),image=document.querySelector('#timeline-image'),caption=document.querySelector('#timeline-caption');
  const isOrigin=m.year===1996;
  section.classList.toggle('origin-active',isOrigin);
  document.querySelector('.journey-note').hidden=m.year<2024;
  document.querySelector('#timeline-panel').classList.toggle('is-origin',isOrigin);
  document.querySelector('#origin-feature').hidden=!isOrigin;
  document.querySelector('.timeline-visual').hidden=isOrigin;
  const album=albums[m.albumIndex??(m.year===2017?5:-1)];
  const src=album?album.art:m.year>=2024?'assets/albums/mea-culpa.jpg':'assets/demos.svg';
  const description=album?`Capa original de ${album.title} (${album.year})`:m.year>=2024?'Capa do single Mea Culpa (Ah! Ça ira!), de 2024':'Ilustração editorial de uma fita cassete representando a fase das demos';
  const label=album?`${album.title} · ${album.year} / ARTE ORIGINAL`:m.year>=2024?'MEA CULPA (AH! ÇA IRA!) · SINGLE, 2024':'FASE DAS DEMOS · ILUSTRAÇÃO EDITORIAL';
  const [tone,rgb]=palettes[m.year];section.style.setProperty('--era-tone',tone);section.style.setProperty('--era-rgb',rgb);
  image.src=src;image.alt=description;caption.textContent=label;

  activeEra?.cancel();
  if(!instant)activeEra=document.querySelector('.timeline-panel').animate([{opacity:.25,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.2,.7,.2,1)'});
}
export function enhanceMembers(isReduced){
  document.querySelectorAll('.member-list details').forEach(details=>{
    let animation=null,expanded=details.open;
    const summary=details.querySelector('summary');
    summary.addEventListener('click',event=>{
      event.preventDefault();expanded=!expanded;
      const start=details.getBoundingClientRect().height;animation?.cancel();
      details.open=true;details.style.height='auto';
      const end=expanded?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+1;
      if(isReduced()){details.open=expanded;details.style.height='';return;}
      details.style.overflow='hidden';
      const current=details.animate([{height:start+'px'},{height:end+'px'}],{duration:380,easing:'cubic-bezier(.25,.8,.25,1)'});animation=current;
      current.onfinish=()=>{if(animation!==current)return;details.open=expanded;details.style.height='';details.style.overflow='';animation=null;};
    });
  });
}
export function setupAtmosphere(isReduced){
  setupPrologue(isReduced);
  const hero=document.querySelector('.hero');let frame=0,x=0,y=0;
  hero.addEventListener('pointermove',event=>{
    if(isReduced()||!matchMedia('(min-width:721px) and (pointer:fine)').matches)return;
    const r=hero.getBoundingClientRect();x=(event.clientX-r.left)/r.width-.5;y=(event.clientY-r.top)/r.height-.5;
    if(!frame)frame=requestAnimationFrame(()=>{hero.style.setProperty('--depth-x',`${x*14}px`);hero.style.setProperty('--depth-y',`${y*10}px`);frame=0;});
  });
  hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--depth-x','0px');hero.style.setProperty('--depth-y','0px');});
}
