const origin = (process.env.TISONIK_MONITOR_ORIGIN || 'https://tisonik.com').replace(/\/$/, '')
const checks = [
  ['site','/'], ['demo','/product-app/'], ['pilot','/pilot/#contact'], ['portal','/portal/'], ['health','/api/health'], ['database','/api/health?deep=1'],
]
for (const [name,path] of checks) {
  const started=performance.now(), response=await fetch(`${origin}${path}`,{headers:{'User-Agent':'TisonikReadinessMonitor/1.1'}}), body=await response.text()
  if(!response.ok)throw new Error(`${name} failed with ${response.status}`)
  if(name==='database'&&!body.includes('"database":"connected"'))throw new Error('database deep health did not confirm connection')
  if(['site','demo','pilot','portal'].includes(name)&&!body.includes('Tisonik'))throw new Error(`${name} response is incomplete`)
  console.log(JSON.stringify({name,status:response.status,latencyMs:Math.round(performance.now()-started)}))
}
