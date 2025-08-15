#!/bin/sh
if ! which emcc > /dev/null 2>&1; then
    echo "Error: emcc not found in PATH" >&2
    exit 1
fi

EMCC_BIN=$(dirname $(dirname $(which emcc)))/bin

$EMCC_BIN/clang -I../include -target wasm32-unknown-unknown -Wl,--no-entry -nostdlib -O2 \
    builtin-wasm-test-fp-sig.c -o builtin-wasm-test-fp-sig.wasm -mgc

