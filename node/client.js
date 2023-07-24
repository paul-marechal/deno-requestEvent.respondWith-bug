// @ts-check
/// <reference types="node" />
const events = require('events')

events.setMaxListeners(Infinity)

/** Number of parallel requests to make */
const n = parseInt(process.argv[2] ?? '2000', 10)
const targetUrl = 'http://localhost:8080/test'

const aborter = new AbortController()
process.on('SIGINT', () => aborter.abort())
console.log('ctrl+c to abort pending requests')

import('../spam.mjs').then(({ default: spam }) => {
    spam(n, targetUrl, aborter)
})
