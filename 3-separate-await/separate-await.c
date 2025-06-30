#include "common.h"


WASM_IMPORT("logInt")
void logInt(int value);

WASM_IMPORT("logString")
void logString(const char* value);

WASM_IMPORT("fakeAsyncHttpRequest")
__externref_t fakeAsyncHttpRequest(int x);

WASM_IMPORT("fakeAsyncDbQuery")
__externref_t fakeAsyncDbQuery(int x);


WASM_IMPORT("awaitInt")
int awaitInt(__externref_t);

WASM_EXPORT("fakePyFunc")
void fakePyFunc(int x) {
  logString("Call fakeAsyncHttpRequest");
  __externref_t promiseHttpRequest = fakeAsyncHttpRequest(x);
  logString("Call fakeAsyncDbQuery");
  __externref_t promiseDbQuery = fakeAsyncDbQuery(x);
  logString("Suspending for promiseHttpRequest");
  int res1 = awaitInt(promiseHttpRequest);
  logString("-- got res1:");
  logInt(res1);

  logString("Suspending for promiseDbQuery");
  int res2 = awaitInt(promiseDbQuery);
  logString("Got res2:");
  logInt(res2);
}
