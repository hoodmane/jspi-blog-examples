#!/bin/env -S node --experimental-wasm-jspi

import { loadPyodide } from "pyodide";

const py = await loadPyodide();

py.runPython(`
from pyodide.ffi import run_sync
from js import fetch

async def async_http_request(url):
    resp = await fetch(url)
    return await resp.text()

def await_async_http_request(url):
    # Suspend for async_http_request to complete
    return run_sync(async_http_request(url))
`);

const await_async_http_request = py.globals.get("await_async_http_request");

try {
  console.log("This will throw an error:");
  await_async_http_request("https://example.com");
  console.log("This never gets executed");
} catch (e) {
  // Can't stack switch
  console.log("Error was:", e, "\n\n");
}

console.log("This will work:");
const result = await await_async_http_request.callPromising(
  "https://example.com",
);
console.log("got:", result.slice(0, 100));
