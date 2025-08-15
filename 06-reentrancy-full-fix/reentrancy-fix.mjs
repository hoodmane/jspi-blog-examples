#!/bin/env -S node --experimental-wasm-jspi

import { readFileSync } from "fs";
import { StackState } from "./stack_state.mjs";

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

async function sleep(ms) {
  // Save
  const curStackTop = stackTop;
  const curStackBottom = stackPointer.value;
  const stackState = new StackState(curStackTop, curStackBottom);
  // Suspend
  await new Promise((res) => setTimeout(res, ms));
  // Restore the stack
  stackState.restore(HEAP);
  stackPointer.value = curStackBottom;
  stackTop = curStackTop;
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
  readFileSync("reentrancy-fix.wasm"),
  imports,
);
const HEAP = new Uint8Array(instance.exports.memory.buffer);
const stackPointer = instance.exports.__stack_pointer;

let stackTop;
function promisingExport(func) {
  const promisingFunc = WebAssembly.promising(func);
  return async function (...args) {
    stackTop = stackPointer.value;
    return await promisingFunc(...args);
  };
}

const allocateOnStackAndSleep = promisingExport(
  instance.exports.allocateOnStackAndSleep,
);
const victim = promisingExport(instance.exports.victim);
const overwritesVictimsStack = instance.exports.overwritesVictimsStack;

// allocates 16 bytes on stack
const pResetStack = allocateOnStackAndSleep();
// allocates more data on stack below `allocateOnStackAndSleep()`.
const pVictim = victim();
// Resets stack pointer
await pResetStack;
overwritesVictimsStack();
await pVictim;
