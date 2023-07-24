# Deno `requestEvent.respondWith` bug

See https://github.com/denoland/deno/issues/19920

There is both a Deno and Node implementation for both the client and server.

The client will spam `http://localhost:8080/test` with 2000 concurrent GET
requests. You can abort using `Ctrl+C` but it will also abort automatically
after 10s. You can pass a positional argument when running the client to send
more or less concurrent requests (`n`).

The server will wait 5s before answering back on `GET /test` with status 200 and
`cool` as body. Any other path will return an instant 404.

It seems like the Deno server will hang on `respondEvent.respondWith` when there
is a high amount of concurrent requests. The Node server doesn't seem to have
that issue.

## Commands

```sh
# under deno/
deno run --allow-net server.ts # runs on localhost:8080
deno run --allow-net client.ts (n=2000)
```

```sh
# under node/
node server.js # runs on localhost:8080
node client.js (n=2000)
```

## Environment

```
$ deno --version
deno 1.35.2 (release, x86_64-pc-windows-msvc)
v8 11.6.189.7
typescript 5.1.6
```

```
$ node -v
node 18.16.1
```
