To use,

1. Make sure you are using node version 24.
2. Install Pyodide with `npm i`.
3. All of the examples must be run with `node --experimental-wasm-jspi`
4. I have checked in the compiled webassembly, so it is not required to run the
   examples but if you want to recompile with changed C code, you'll need clang.
   I used clang 20 but older clangs will probably work too.
