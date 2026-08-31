import { createOperatorEdge } from './server.mjs'

const port = Number(process.env.PORT || 8787)
const edge = createOperatorEdge({ databasePath: process.env.CRUISECONNECT_EDGE_DB || './data/cruiseconnect-edge.sqlite' })
edge.server.listen(port, '0.0.0.0', () => console.log(JSON.stringify({ level: 'info', message: 'CruiseConnect operator edge ready', port, version: '1.1.2' })))

for (const signal of ['SIGINT','SIGTERM']) process.on(signal, async () => { await edge.close(); process.exit(0) })
