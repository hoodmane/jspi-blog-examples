#!/bin/env -S node --experimental-wasm-jspi
import { readFileSync } from "fs";

// Utils
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// Logging imports (these replace printf since we don't have libc)
function logInt(x) {
  console.log("C:", x);
}

function logString(ptr) {
  let endPtr = ptr;
  // Locate null byte terminator
  while (HEAP[endPtr]) {
    endPtr++;
  }
  console.log("C:", new TextDecoder().decode(HEAP.slice(ptr, endPtr)));
}

// Our async function we want to call from synchronous C code
async function awaitFakeFetch(x) {
  console.log("JS: fetching (fake)...");
  await sleep(1000); // simulate a slow fetch request
  console.log("JS: fetched (fake)");
  return x + 1;
}

const imports = {
  env: {
    logInt,
    logString,
    awaitFakeFetch: new WebAssembly.Suspending(awaitFakeFetch),
  },
};

export const { instance } = await WebAssembly.instantiate(
  readFileSync("fpcast.wasm"),
  imports,
);
const HEAP = new Uint8Array(instance.exports.memory.buffer);

export const fakePyFunc = WebAssembly.promising(
  instance.exports.fakePyFunc,
);

console.log("JS: Calling pythonFunction(0, 2, 3)");
await fakePyFunc(0, 2, 3);
console.log("JS: Calling pythonFunction(1, 2, 3)");
await fakePyFunc(1, 2, 3);
console.log("JS: Calling pythonFunction(2, 2, 3)");
await fakePyFunc(2, 2, 3);
console.log("JS: Calling pythonFunction(3, 2, 3)");
await fakePyFunc(3, 2, 3);
