import { readFile } from 'node:fs/promises'

const report=JSON.parse(await readFile(process.argv[2]||'trivy-results.json','utf8'))
const findings=(report.Results||[]).flatMap(result=>(result.Vulnerabilities||[]).filter(item=>['HIGH','CRITICAL'].includes(item.Severity)).map(item=>({target:result.Target,id:item.VulnerabilityID,package:item.PkgName,installed:item.InstalledVersion,fixed:item.FixedVersion||'unavailable',severity:item.Severity,title:item.Title||''})))
for(const finding of findings)console.error(`::error file=packages/operator-edge/Dockerfile,title=${finding.severity} ${finding.id}::${finding.package} ${finding.installed} → ${finding.fixed} · ${finding.title}`)
if(findings.length)throw new Error(`Container contains ${findings.length} fixable high/critical vulnerability finding(s).`)
console.log('Container has no fixable high or critical vulnerabilities.')
