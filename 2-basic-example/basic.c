#include "common.h"

WASM_IMPORT("awaitFakeFetch")
int awaitFakeFetch(int x);

WASM_IMPORT("logInt")
void logInt(int value);

WASM_IMPORT("logString")
void logString(const char* value);

WASM_EXPORT("fakePyFunc")
void fakePyFunc(int x) {
    logString("About to call awaitFakeFetch");
    int res = awaitFakeFetch(x);
    logString("Got result:");
    logInt(res);
}
