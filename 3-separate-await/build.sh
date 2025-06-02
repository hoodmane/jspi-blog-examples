#!/bin/sh
clang -I../include -target wasm32-unknown-unknown -Wl,--no-entry -nostdlib -O2 \
    separate-await.c -o separate-await.wasm
