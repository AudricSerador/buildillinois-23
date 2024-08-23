const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

console.log('Starting Next.js server...')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  console.log('Next.js app prepared')
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(8080, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:8080')
  })
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason)
})