#include "common.h"

WASM_IMPORT("awaitFakeFetch")
int awaitFakeFetch(int x);

WASM_IMPORT("logInt")
void logInt(int value);

WASM_IMPORT("logString")
void logString(const char* value);

typedef int (*F)(int, int);
typedef int (*F1)(int);
typedef int (*F0)(void);

WASM_IMPORT("countArgs")
int countArgs(F func);

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


int callHandler(F f, int x, int y) {
  int nargs = countArgs(f);
  switch (nargs) {
    case 2:  
      logString("Two arguments");
      return f(x, y);
    case 1:
      logString("One argument");
      return ((F1)f)(x);
    case 0:
      logString("Zero arguments");
      return ((F0)f)();
    default:
      logString("Bad handler");
      return -1;
  }
}

WASM_EXPORT("fakePyFunc")
void fakePyFunc(int func_index, int x, int y) {
  int res = callHandler(handlers[func_index], x, y);

  logString("Got result:");
  logInt(res);
}
