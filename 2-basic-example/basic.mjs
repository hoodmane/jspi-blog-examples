#!/bin/env -S node --experimental-wasm-stack-switching
import { readFileSync } from "fs";

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

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function awaitAsyncHttpRequest(x) {
  // Actually just sleep lol
  console.log("JS: sleeping");
  await sleep(1000);
  console.log("JS: slept");
  return x + 1;
}

const imports = {
  env: {
    logInt,
    logString,
    awaitAsyncHttpRequest: new WebAssembly.Suspending(awaitAsyncHttpRequest),
  },
};

export const { instance } = await WebAssembly.instantiate(
  readFileSync("basic.wasm"),
  imports,
);
const HEAP = new Uint8Array(instance.exports.memory.buffer);
export const pythonFunction = WebAssembly.promising(
  instance.exports.pythonFunction,
);
console.log("JS: Calling pythonFunction(3)");
await pythonFunction(3);
