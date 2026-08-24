const nav=document.querySelector('.nav');
const menu=document.querySelector('.menu-btn');
const links=document.querySelectorAll('.nav-links a');

function closeMenu(){
  if(!nav||!menu)return;
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded','false');
  menu.setAttribute('aria-label','Open navigation');
}

function toggleMenu(){
  if(!nav||!menu)return;
  const open=!nav.classList.contains('open');
  nav.classList.toggle('open',open);
  menu.setAttribute('aria-expanded',open?'true':'false');
  menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');
}

menu?.addEventListener('click',toggleMenu);
links.forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
document.addEventListener('click',event=>{if(nav?.classList.contains('open')&&!nav.contains(event.target))closeMenu()});

const form=document.querySelector('#pilot-request-form');
if(form){
  const status=form.querySelector('.form-status');
  const button=form.querySelector('button[type="submit"]');
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!status||!button)return;
    status.textContent='';status.className='form-status';
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const payload={
      name:String(data.get('name')||''),
      workEmail:String(data.get('workEmail')||''),
      company:String(data.get('company')||''),
      role:String(data.get('role')||''),
      segment:String(data.get('segment')||''),
      footprint:String(data.get('footprint')||''),
      message:String(data.get('message')||''),
      website:String(data.get('website')||''),
      consent:data.get('consent')==='yes',
      sourceUrl:window.location.href,
    };
    const original=button.textContent;
    button.disabled=true;
    button.setAttribute('aria-busy','true');
    button.textContent='Sending…';
    status.textContent='Sending your pilot request…';
    try{
      const response=await fetch('https://phhpiqwvgwlgjmyiksqe.supabase.co/functions/v1/regreenity-pilot-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const body=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(body.error||'Request could not be sent.');
      form.reset();
      status.textContent=`Request received${body.reference?` · Ref ${body.reference}`:''}. We’ll review it and follow up directly.`;
      status.className='form-status ok';
      status.focus?.();
    }catch(error){
      status.textContent=error instanceof Error?error.message:'Request could not be sent.';
      status.className='form-status error';
    }finally{
      button.disabled=false;
      button.removeAttribute('aria-busy');
      button.textContent=original||'Request a pilot';
    }
  });
}
