#include "common.h"


WASM_IMPORT("logInt")
void logInt(int value);

WASM_IMPORT("logString")
void logString(const char* value);

WASM_IMPORT("asyncHttpRequest")
__externref_t asyncHttpRequest(int x);

WASM_IMPORT("asyncDbQuery")
__externref_t asyncDbQuery(int x);


WASM_IMPORT("awaitInt")
int awaitInt(__externref_t);

WASM_EXPORT("pythonFunction")
void pythonFunction(int x) {
    logString("Call asyncHttpRequest");
    __externref_t promiseHttpRequest = asyncHttpRequest(x);
    logString("Call asyncDbQuery");
    __externref_t promiseDbQuery = asyncDbQuery(x);
    logString("Suspending for promiseHttpRequest");
    int res1 = awaitInt(promiseHttpRequest);
    logString("-- got res1:");
    logInt(res1);

    logString("Suspending for promiseDbQuery");
    int res2 = awaitInt(promiseDbQuery);
    logString("Got res2:");
    logInt(res2);
}
