#!/bin/env -S node --experimental-wasm-jspi
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

function awaitInt(promise) {
  // This is just the identity function...
  // We need it so we can wrap it with WebAssembly.Suspending
  return promise;
}

async function fakeAsyncHttpRequest(x) {
  console.log("JS: fakeAsyncHttpRequest: sleeping");
  await sleep(1000);
  console.log("JS: fakeAsyncHttpRequest: slept");
  return x + 1;
}

async function fakeAsyncDbQuery(x) {
  console.log("JS: fakeAsyncDbQuery: sleeping");
  await sleep(2000);
  console.log("JS: fakeAsyncDbQuery: slept");
  return x * x;
}

const imports = {
  env: {
    logInt,
    logString,
    fakeAsyncHttpRequest,
    fakeAsyncDbQuery,
    awaitInt: new WebAssembly.Suspending(awaitInt),
  },
};

export const { instance } = await WebAssembly.instantiate(
  readFileSync("separate-await.wasm"),
  imports,
);
const HEAP = new Uint8Array(instance.exports.memory.buffer);
export const fakePyFunc = WebAssembly.promising(
  instance.exports.fakePyFunc,
);

await fakePyFunc(4);
