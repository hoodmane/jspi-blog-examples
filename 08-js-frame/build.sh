 #!/bin/sh
clang -I../include -target wasm32-unknown-unknown -Wl,--no-entry -nostdlib -O2 \
    js-frame.c -o js-frame.wasm -Wl,--export-table
