export function setupPrologue(isReduced){
  const feature=document.querySelector('#origin-feature'),button=document.querySelector('#name-transition');
  if(!feature||!button)return;
  if('IntersectionObserver' in window && !isReduced()){
    feature.classList.add('prologue-ready');
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){feature.classList.add('is-seen');observer.disconnect();}},{threshold:.12});
    observer.observe(feature);
  }
  button.addEventListener('click',()=>{
    const next=document.querySelector('#tab-2001');
    next.click();next.focus({preventScroll:true});
    next.scrollIntoView({block:'nearest',inline:'nearest',behavior:isReduced()?'instant':'smooth'});
  });
}
