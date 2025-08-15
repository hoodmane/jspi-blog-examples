#include "common.h"

WASM_IMPORT("awaitFakeFetch")
int awaitFakeFetch(int x);

WASM_IMPORT("logInt")
void logInt(int value);

WASM_IMPORT("logString")
void logString(const char* value);


typedef int (*F)(int, int);

int handler0(int x, int y) {
  logString("Handler 0 doesn't stack switch");
  return x*y;
}

int handler1(int x) {
  logString("Handler 1 doesn't stack switch");
  return x*x;
}

int handler2(int x, int y) {
  logString("Handler 2 fetch x");
  int resx = awaitFakeFetch(x);
  logString("      ... fetch y");
  int resy = awaitFakeFetch(y);
  return x * y;
}

int handler3(int x) {
  logString("Handler 3 fetch x");
  int res = awaitFakeFetch(x);
  return res * res;
}
F handlers[] = {(F)handler0, (F)handler1, (F)handler2, (F)handler3 };


WASM_EXPORT("fakePyFunc")
void fakePyFunc(int func_index, int x, int y) {
  int res = handlers[func_index](x, y);
  logString("Got result:");
  logInt(res);
}
