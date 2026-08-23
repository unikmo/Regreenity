const nav=document.querySelector('.nav');const menu=document.querySelector('.menu-btn');menu?.addEventListener('click',()=>{nav?.classList.toggle('open');menu.setAttribute('aria-expanded',nav?.classList.contains('open')?'true':'false')});document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('open')));

const form=document.querySelector('#pilot-request-form');
if(form){
  const status=form.querySelector('.form-status');
  const button=form.querySelector('button[type="submit"]');
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();
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
    button.disabled=true;button.textContent='Sending…';
    try{
      const response=await fetch('https://phhpiqwvgwlgjmyiksqe.supabase.co/functions/v1/regreenity-pilot-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const body=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(body.error||'Request could not be sent.');
      form.reset();status.textContent=`Request received${body.reference?` · Ref ${body.reference}`:''}. We’ll review it and follow up directly.`;status.className='form-status ok';
    }catch(error){status.textContent=error instanceof Error?error.message:'Request could not be sent.';status.className='form-status error'}
    finally{button.disabled=false;button.textContent='Request a pilot'}
  });
}
