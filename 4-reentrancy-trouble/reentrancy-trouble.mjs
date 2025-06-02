#!/bin/env -S node --experimental-wasm-stack-switching

import { readFileSync } from "fs";

function decodeStr(ptr) {
  let endPtr = ptr;
  // Locate null byte terminator
  while (HEAP[endPtr]) {
    endPtr++;
  }
  return new TextDecoder().decode(HEAP.slice(ptr, endPtr));
}

function logStrStr(p1, p2) {
  console.log(decodeStr(p1), decodeStr(p2));
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

const imports = {
  env: {
    logStrStr,
    sleep: new WebAssembly.Suspending(sleep),
    // Does nothing, just forces variables to be allocated on stack
    escape(ptr) {},
  },
};

const { instance } = await WebAssembly.instantiate(
  readFileSync("reentrancy-trouble.wasm"),
  imports,
);
const HEAP = new Uint8Array(instance.exports.memory.buffer);
const allocateOnStackAndSleep = WebAssembly.promising(
  instance.exports.allocateOnStackAndSleep,
);
const victim = WebAssembly.promising(instance.exports.victim);
const overwritesVictimsStack = instance.exports.overwritesVictimsStack;

// allocates 16 bytes on stack
const pResetStack = allocateOnStackAndSleep();
// allocates more data on stack below `allocateOnStackAndSleep()`.
const pVictim = victim();
// Resets stack pointer
await pResetStack;
overwritesVictimsStack();
await pVictim;
