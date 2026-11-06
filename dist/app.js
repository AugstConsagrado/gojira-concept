import { albums, milestones } from './content.js';
import { showEra, enhanceMembers, setupAtmosphere } from './experience.js';
const $ = s => document.querySelector(s);
const albumReveals=new Set();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 1100px) and (min-height: 650px) and (pointer: fine)');
let motionOff = reducedMotion.matches;
try { motionOff = reducedMotion.matches || localStorage.getItem('gojira-motion') === 'off'; } catch {}
const track = $('#album-track'), windowEl = $('.album-window'), section = $('.discography');
albums.forEach((album,index) => {
  const card = document.createElement('article'); card.className='album-card'; card.dataset.index=index;
  const listen=document.createElement('a');listen.className='album-listen';listen.href=album.url;listen.target='_blank';listen.rel='noopener noreferrer';
  listen.setAttribute('aria-label',`Ouvir o álbum ${album.title}, ${album.year}, no Apple Music`);
  const art=document.createElement('div');art.className='album-art';
  const img=document.createElement('img');img.src=album.art;img.alt=`Capa original de ${album.title} (${album.year})`;img.loading='lazy';img.width=600;img.height=600;art.append(img);
  const title=document.createElement('h3');title.className='album-title';title.append(document.createTextNode(album.title));
  const year=document.createElement('small');year.textContent=album.year;title.append(year);
  const label=document.createElement('p');label.className='album-type';label.textContent=`0${index+1} / ÁLBUM DE ESTÚDIO`;
  listen.append(art,title,label);
  const detail=document.createElement('button');detail.className='album-detail';detail.textContent='Sobre este álbum +';detail.setAttribute('aria-label',`Ver detalhes e faixas de ${album.title}`);detail.onclick=()=>openAlbum(index);
  card.append(listen,detail);track.append(card);
});
function openAlbum(index){
  const album=albums[index];$('#album-dialog-art').replaceChildren();
  const image=document.createElement('img');image.src=album.art;image.alt=`Capa original de ${album.title}`;$('#album-dialog-art').append(image);
  $('#album-dialog-year').textContent=`${album.year} / ÁLBUM DE ESTÚDIO`;
  $('#album-dialog-title').textContent=album.title;$('#album-dialog-description').textContent=album.description;$('#album-dialog-link').href=album.url;
  const tracks=$('#album-dialog-tracks');tracks.replaceChildren();
  const label=document.createElement('p');label.className='small-label';label.textContent='FAIXAS PARA COMEÇAR';tracks.append(label);
  album.trackLinks.forEach(track=>{const link=document.createElement('a');link.href=track.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=track.title+' ↗';tracks.append(link);});
  $('#album-dialog').showModal();
}
document.querySelectorAll('.dialog-close').forEach(button=>button.onclick=()=>button.closest('dialog').close());
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
$('#credits-open').onclick=()=>$('#credits-dialog').showModal();
$('#menu-toggle').onclick=()=>setMenu($('#menu-toggle').getAttribute('aria-expanded')!=='true');
function setMenu(open){$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#navigation').classList.toggle('open',open);$('#menu-toggle span').textContent=open?'−':'＋';}
document.querySelectorAll('#navigation a').forEach(a=>a.onclick=()=>setMenu(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
const tabs=[...document.querySelectorAll('[data-year]')];
function setYear(tab,focus=false){
  const year=tab.dataset.year,m=milestones.find(item=>String(item.year)===year);
  tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});
  $('.timeline-year').textContent=year;$('#milestone-label').textContent=m.label;$('#milestone-title').textContent=m.title;$('#milestone-paragraphs').replaceChildren(...m.paragraphs.map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));$('#milestone-source').href=m.source;$('#milestone-source').textContent=m.sourceLabel+' ↗';$('#timeline-panel').setAttribute('aria-labelledby',tab.id);
  showEra(m,albums,motionOff);
  if(focus){tab.focus();tab.scrollIntoView({block:'nearest',inline:'nearest',behavior:motionOff?'instant':'smooth'});}
}
tabs.forEach((tab,i)=>{tab.onclick=()=>setYear(tab);tab.onkeydown=e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();setYear(tabs[next],true);}};});
let pinned=false, tick=false, lastCounter=-1;
function layout(){
  pinned=desktop.matches&&!motionOff;
  section.classList.toggle('pinned',pinned);
  track.style.transform='';windowEl.scrollLeft=0;update();
}
function update(){
  tick=false;
  const maxPage=document.documentElement.scrollHeight-innerHeight;
  $('.reading-progress').style.transform=`scaleX(${maxPage>0?Math.min(1,scrollY/maxPage):0})`;
  let progress;
  
  if(pinned){
    const rect=section.getBoundingClientRect(), distance=section.offsetHeight-innerHeight;
    progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,distance)));
    const travel=Math.max(0,track.scrollWidth-windowEl.clientWidth+2*parseFloat(getComputedStyle(windowEl).paddingLeft));
    track.style.transform=`translateX(${-Math.round(progress*travel)}px)`;
  }else progress=windowEl.scrollLeft/Math.max(1,track.scrollWidth-windowEl.clientWidth+2*parseFloat(getComputedStyle(windowEl).paddingLeft));

  track.querySelectorAll('.album-card').forEach(card=>{card.style.transform='';card.style.filter='';});
  const index=Math.max(0,Math.min(albums.length-1,Math.round(progress*(albums.length-1))));
  if(index!==lastCounter){$('#album-counter').textContent=`0${index+1} — 07`;lastCounter=index;}
  $('#album-prev').disabled=index===0;$('#album-next').disabled=index===albums.length-1;
}
function schedule(){if(!tick){tick=true;requestAnimationFrame(update);}}
function moveAlbum(direction){
  const current=lastCounter<0?0:lastCounter,next=Math.max(0,Math.min(albums.length-1,current+direction));
  if(pinned){const rect=section.getBoundingClientRect();const top=scrollY+rect.top;scrollTo({top:top+(section.offsetHeight-innerHeight)*next/(albums.length-1),behavior:motionOff?'instant':'smooth'});}
  else {const travel=Math.max(0,track.scrollWidth-windowEl.clientWidth+2*parseFloat(getComputedStyle(windowEl).paddingLeft));windowEl.scrollTo({left:travel*next/(albums.length-1),behavior:motionOff?'instant':'smooth'});}
}
$('#album-prev').onclick=()=>moveAlbum(-1);$('#album-next').onclick=()=>moveAlbum(1);
windowEl.addEventListener('scroll',schedule,{passive:true});
windowEl.addEventListener('keydown',e=>{if(e.target!==windowEl)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveAlbum(e.key==='ArrowRight'?1:-1);}});
function applyMotion(){
  if(motionOff){albumReveals.forEach(animation=>animation.cancel());albumReveals.clear();}
  document.body.classList.toggle('motion-off',motionOff);$('#motion-toggle').setAttribute('aria-pressed',String(motionOff));$('#motion-toggle').textContent=`Movimento: ${motionOff?'reduzido':'ligado'}`;layout();
}
$('#motion-toggle').onclick=()=>{motionOff=!motionOff;try{localStorage.setItem('gojira-motion',motionOff?'off':'on');}catch{}applyMotion();};
reducedMotion.addEventListener('change',()=>{motionOff=reducedMotion.matches;applyMotion();});
desktop.addEventListener('change',layout);
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
if('IntersectionObserver' in window){document.body.classList.add('enhanced');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));}
document.fonts.ready.then(layout);applyMotion();

let keyboardNavigation=false;
document.addEventListener('keydown',event=>{if(event.key==='Tab')keyboardNavigation=true;},true);
document.addEventListener('pointerdown',()=>{keyboardNavigation=false;},true);
track.addEventListener('focusin',event=>{
  if(!pinned || !keyboardNavigation)return;
  const card=event.target.closest('.album-card');if(!card)return;
  const rect=card.getBoundingClientRect(),viewport=windowEl.getBoundingClientRect();
  if(rect.left>=viewport.left && rect.right<=viewport.right)return;
  const travel=Math.max(1,track.scrollWidth-windowEl.clientWidth+2*parseFloat(getComputedStyle(windowEl).paddingLeft));
  const desired=Math.max(0,Math.min(travel,card.offsetLeft-parseFloat(getComputedStyle(windowEl).paddingLeft)));
  const top=scrollY+section.getBoundingClientRect().top;
  windowEl.scrollLeft=0;scrollTo({top:top+(section.offsetHeight-innerHeight)*desired/travel,behavior:'instant'});
});

enhanceMembers(() => motionOff);
setupAtmosphere(() => motionOff);
showEra(milestones[0],albums,true);

// Revelação de capas inspirada no ritmo visual da referência enviada.
if('IntersectionObserver' in window){
  const albumObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting||entry.intersectionRatio<.18)return;
    if(!motionOff&&desktop.matches){
      const animation=entry.target.querySelector('.album-art').animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],{duration:850,easing:'cubic-bezier(.22,1,.36,1)'});
      albumReveals.add(animation);animation.onfinish=()=>albumReveals.delete(animation);
    }
    albumObserver.unobserve(entry.target);
  }),{root:windowEl,threshold:[.18,.5]});
  document.querySelectorAll('.album-card').forEach(card=>albumObserver.observe(card));
}
