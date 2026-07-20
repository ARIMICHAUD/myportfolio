const root=document.documentElement;const toggle=document.getElementById('lang');const year=document.getElementById('year');year.textContent=new Date().getFullYear();function setLang(lang){root.dataset.lang=lang;root.lang=lang;document.querySelectorAll('[data-fr][data-en]').forEach(el=>el.textContent=el.dataset[lang]);toggle.textContent=lang==='fr'?'EN':'FR';localStorage.setItem('portfolio-lang',lang)}setLang(localStorage.getItem('portfolio-lang')||'fr');toggle.addEventListener('click',()=>setLang(root.dataset.lang==='fr'?'en':'fr'));


document.querySelectorAll('[data-carousel]').forEach((carousel)=>{const slides=[...carousel.querySelectorAll('.carousel-slide')];const dots=carousel.parentElement.querySelector('.carousel-dots');let current=0;function show(i){current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('active',n===current));[...dots.children].forEach((d,n)=>d.classList.toggle('active',n===current));}slides.forEach((_,i)=>{const d=document.createElement('button');d.type='button';d.setAttribute('aria-label',`Afficher la photo ${i+1}`);d.onclick=()=>show(i);dots.appendChild(d)});carousel.querySelector('.prev').onclick=()=>show(current-1);carousel.querySelector('.next').onclick=()=>show(current+1);show(0)});


const revealSections=document.querySelectorAll('.reveal-section');
if('IntersectionObserver' in window){
  const revealObserver=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}})
  },{threshold:.08,rootMargin:'0px 0px -40px'});
  revealSections.forEach(section=>revealObserver.observe(section));
}else{revealSections.forEach(section=>section.classList.add('is-visible'))}
