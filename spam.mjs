// @ts-check

/**
 * @param {number} n
 * @param {string} targetUrl
 * @param {AbortController} aborter
 */
export default async function spam(n, targetUrl, aborter) {
    let successCount = 0
    const pendingRequests = new Set()
    /** @type {Record<string, number>} */
    const errors = Object.create(null)

    console.log(`will send ${n} requests...`)
    const start = Date.now()
    const tasks = []
    for (let i = 0; i < n; i++) {
        const taskId = i
        tasks.push(
            fetch(targetUrl, { signal: aborter.signal })
                .then(handleResponse, handleError)
                .finally(() => pendingRequests.delete(taskId))
        )
        pendingRequests.add(taskId)
    }
    const timeout = setTimeout(abort, 10_000)
    console.log(`waiting for ${pendingRequests.size} requests...`)
    await Promise.all(tasks)
    const end = Date.now()
    console.log(`all tasks settled (took ${(end - start) / 1000}s)`)
    clearTimeout(timeout)
    for (const [message, count] of Object.entries(errors)) {
        console.log(`(${count}) ${message}`)
    }

    /** @param {Response} res */
    async function handleResponse(res) {
        if (res.status === 200) {
            const body = await res.text()
            if (body === 'cool') {
                successCount += 1
            } else {
                errors['body not cool'] ??= 0
                errors['body not cool'] += 1
            }
        } else {
            errors[res.status] ??= 0
            errors[res.status] += 1
        }
    }

    function handleError(err) {
        let message = err.message
        if (err.cause?.code) {
            message += ' ' + err.cause?.code
        }
        errors[message] ??= 0
        errors[message] += 1
    }

    function abort() {
        console.log(`aborting ${pendingRequests.size} pending request(s)`)
        aborter.abort()
    }
}
