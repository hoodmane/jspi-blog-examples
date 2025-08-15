#!/bin/sh
if ! which emcc > /dev/null 2>&1; then
    echo "Error: emcc not found in PATH" >&2
    exit 1
fi

EMCC_BIN=$(dirname $(dirname $(which emcc)))/bin
$EMCC_BIN/wasm-as countArgs.wat -o countArgs.wasm --enable-gc --enable-reference-types

clang -I../include -target wasm32-unknown-unknown -Wl,--no-entry -nostdlib -O2 \
    wat-count-args.c -o wat-count-args.pre.wasm -Wl,--export-table

$EMCC_BIN/wasm-merge wat-count-args.pre.wasm env countArgs.wasm env -o wat-count-args.wasm --enable-gc --enable-reference-types
