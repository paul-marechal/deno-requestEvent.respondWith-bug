// @ts-check
/// <reference types="node" />
const http = require('http')

const host = 'localhost'
const port = 8080

let receivedRequests = 0
let pendingRequests = 0
let completedRequests = 0

process.on('SIGINT', () => {
    printInfo()
    process.exit(0)
})
setInterval(printInfo, 5000);
http.createServer(dispatchRequest)
    .listen({ host, port }, () => {
        console.log(`[${process.pid}] http server listening: http://${host}:${port}`)
    })
    .on('error', error => {
        console.error(error)
        process.exit(1)
    })

function printInfo() {
    console.log(
        `received ${receivedRequests} completed ${completedRequests} pending ${pendingRequests}`,
    );
}

/** @param {http.IncomingMessage} req @param {http.ServerResponse} res */
async function dispatchRequest(req, res) {
    receivedRequests += 1
    pendingRequests += 1
    try {
        if (req.url === '/test') {
            await handleTest(req, res)
        } else {
            await notFound(req, res)
        }
        completedRequests += 1
    } catch (error) {
        console.error(error)
    } finally {
        pendingRequests -= 1
    }
}

/** @param {http.IncomingMessage} req @param {http.ServerResponse} res */
async function handleTest(req, res) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    res.statusCode = 200
    res.statusMessage = 'OK'
    res.end('cool')
}

/** @param {http.IncomingMessage} req @param {http.ServerResponse} res */
function notFound(req, res) {
    res.statusCode = 404
    res.statusMessage = 'NOT FOUND'
    res.end('not found')
}
