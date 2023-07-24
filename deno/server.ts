const hostname = "localhost";
const port = 8080;

let receivedRequests = 0;
let pendingRequests = 0;
let completedRequests = 0;

Deno.addSignalListener("SIGINT", function sigint() {
  printInfo();
  Deno.exit(0);
});
setInterval(printInfo, 5000);
serve(Deno.listen({ hostname, port }));

function printInfo() {
  console.log(
    `received ${receivedRequests} completed ${completedRequests} pending ${pendingRequests}`,
  );
}

async function serve(server: Deno.Listener) {
  console.log(
    `[${Deno.pid}] http server listening: http://${hostname}:${port}`,
  );
  for await (const conn of server) {
    serveHttp(conn).catch(console.error);
  }
}

async function serveHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    dispatchRequestEvent(requestEvent);
  }
}

async function dispatchRequestEvent(requestEvent: Deno.RequestEvent) {
  receivedRequests += 1;
  pendingRequests += 1;
  try {
    const url = new URL(requestEvent.request.url);
    if (url.pathname === "/test") {
      await handleTest(requestEvent);
    } else {
      await notFound(requestEvent);
    }
    completedRequests += 1;
  } catch (error) {
    console.error(error);
  } finally {
    pendingRequests -= 1;
  }
}

async function handleTest(requestEvent: Deno.RequestEvent) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await requestEvent.respondWith(new Response("cool"));
}

async function notFound(requestEvent: Deno.RequestEvent) {
  await requestEvent.respondWith(
    new Response("404 not found", { status: 404 }),
  );
}
