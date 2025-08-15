#!/bin/sh
clang -I../include -target wasm32-unknown-unknown -Wl,--no-entry -nostdlib -O2 \
    reentrancy-fix.c -o reentrancy-fix.wasm
