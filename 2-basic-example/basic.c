#include "common.h"

WASM_IMPORT("awaitAsyncHttpRequest")
int awaitAsyncHttpRequest(int x);

WASM_IMPORT("logInt")
void logInt(int value);

WASM_IMPORT("logString")
void logString(const char* value);

// This doesn't actually have anything to do with Python, but it would in our
// application to the Pyodide code base.
WASM_EXPORT("pythonFunction")
void pythonFunction(int x) {
    logString("About to call awaitAsyncHttpRequest");
    int res = awaitAsyncHttpRequest(x);
    logString("Got result:");
    logInt(res);
}
