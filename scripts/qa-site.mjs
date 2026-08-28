import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'

const root = resolve('dist')
const errors = []
const fail = message => errors.push(message)

const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = join(directory, entry.name)
  return entry.isDirectory() ? walk(path) : [path]
})

if (!existsSync(root)) fail('dist/ does not exist; run the production build first')

const files = existsSync(root) ? walk(root) : []
const htmlFiles = files.filter(file => extname(file) === '.html')

for (const file of htmlFiles) {
  const name = relative(root, file).replaceAll('\\', '/')
  const html = readFileSync(file, 'utf8')
  if (!/<title>[^<]{8,}<\/title>/.test(html)) fail(`${name}: missing useful title`)
  if (!/<meta name="description" content="[^\"]{40,}"/.test(html)) fail(`${name}: missing useful description`)
  if (!/<link rel="canonical" href="https:\/\/regreenity\.com\//.test(html)) fail(`${name}: canonical must be absolute and use regreenity.com`)
  if (!/<meta property="og:image" content="https:\/\/regreenity\.com\//.test(html)) fail(`${name}: Open Graph image must be absolute`)
  if (!/<meta property="og:type" content="website"/.test(html)) fail(`${name}: missing Open Graph type`)
  if (!/<meta property="og:description" content="[^\"]{40,}"/.test(html)) fail(`${name}: missing Open Graph description`)
  if (!/<meta name="twitter:title" content="[^\"]+"/.test(html)) fail(`${name}: missing Twitter title`)
  if (!/<meta name="twitter:description" content="[^\"]{40,}"/.test(html)) fail(`${name}: missing Twitter description`)
  if (!/<meta name="twitter:image" content="https:\/\/regreenity\.com\//.test(html)) fail(`${name}: Twitter image must be absolute`)
  if (!/<script type="application\/ld\+json">/.test(html)) fail(`${name}: missing structured data`)
  if (!/<div id="root"><main class="seo-fallback"/.test(html)) fail(`${name}: missing crawlable static body content`)
  if (/Cruise Connection/i.test(html)) fail(`${name}: legacy Cruise Connection branding remains`)

  for (const match of html.matchAll(/(?:href|src)="(\/[^\"#?]*)/g)) {
    const target = match[1]
    if (target === '/') continue
    const expected = target.endsWith('/') ? join(root, target, 'index.html') : join(root, target)
    if (!existsSync(expected)) fail(`${name}: broken internal reference ${target}`)
  }
}

for (const required of ['robots.txt', 'sitemap.xml', 'llms.txt', 'llms-full.txt', 'og-card.png']) {
  if (!existsSync(join(root, required))) fail(`missing ${required}`)
}

const sitemap = existsSync(join(root, 'sitemap.xml')) ? readFileSync(join(root, 'sitemap.xml'), 'utf8') : ''
for (const match of sitemap.matchAll(/<loc>https:\/\/regreenity\.com(\/[^<]*)<\/loc>/g)) {
  const path = match[1]
  const expected = path === '/' ? join(root, 'index.html') : join(root, path, 'index.html')
  if (!existsSync(expected)) fail(`sitemap route missing from build: ${path}`)
}

const pilot = join(root, 'pilot', 'index.html')
if (existsSync(pilot)) {
  const html = readFileSync(pilot, 'utf8')
  if (!html.includes('formsubmit.co/hello@planethike.org')) fail('pilot page contact form is not connected to hello@planethike.org')
  if (!html.includes('mailto:hello@planethike.org')) fail('pilot page lacks direct email fallback')
}

for (const file of files.filter(file => /\.(?:jpg|jpeg|png)$/i.test(file))) {
  const data = readFileSync(file)
  const jpeg = data[0] === 0xff && data[1] === 0xd8 && data.at(-2) === 0xff && data.at(-1) === 0xd9
  const png = data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  if (!jpeg && !png) fail(`${relative(root, file)}: invalid image signature`)
}

if (errors.length) {
  console.error(`Site QA failed with ${errors.length} issue(s):\n- ${errors.join('\n- ')}`)
  process.exit(1)
}

console.log(`Site QA passed: ${htmlFiles.length} HTML pages, ${files.length} built files, metadata, static crawl content, routes, contact path and images verified.`)
