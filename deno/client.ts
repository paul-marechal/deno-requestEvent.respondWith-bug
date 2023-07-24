import spam from "../spam.mjs";

/** Number of parallel requests to make */
const n = parseInt(Deno.args[0] ?? "2000", 10);
const targetUrl = "http://localhost:8080/test";

const aborter = new AbortController();
Deno.addSignalListener("SIGINT", () => aborter.abort());
console.log("ctrl+c to abort pending requests");

spam(n, targetUrl, aborter);
