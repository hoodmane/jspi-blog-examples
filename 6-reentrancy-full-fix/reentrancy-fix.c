#include "common.h"

WASM_IMPORT("logStrStr")
void logStrStr(const char* str, const char* value);

WASM_IMPORT("sleep")
void sleep(int x);

WASM_IMPORT("escape")
void escape(void* x);


WASM_EXPORT("allocateOnStackAndSleep")
void allocateOnStackAndSleep() {
  // Allocate 4 bytes on stack. (The stack is always required to be aligned to
  // 16 bytes so we'll bump the stack pointer by 16.)
  int x[] = {7};
  escape(x);
  // Stack switch and allow victim to allocate its stack space below ours
  sleep(0);
  // Now the epilogue will reset the stack pointer
}

WASM_EXPORT("victim")
void victim() {
  // Allocate our string on stack bellow the 16 bytes allocated by
  // `sleepsToResetStackPointer()`
  char x[] = "my important string";
  escape(x);
  logStrStr("victim1", x);
  // While we're sleeping, `allocateOnStackAndSleep()` exits and sets the
  // stack pointer above us. Then `overwritesVictimsStack()` writes over our
  // stack space.
  sleep(500);
  logStrStr("victim2", x);
}

WASM_EXPORT("overwritesVictimsStack")
void overwritesVictimsStack() {
  char x[] = "this is a long string and it will write over lots of other stuff!";
  escape(x);
}
