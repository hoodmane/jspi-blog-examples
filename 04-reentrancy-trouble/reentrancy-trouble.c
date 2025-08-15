#include "common.h"

WASM_IMPORT("logStrStr")
void logStrStr(const char* str, const char* value);

WASM_IMPORT("sleep")
void sleep(int x);

// Escape is a no-op function to ensure that spill stack space is actually allocated.
// Without this, clang will optimize out stack operations.
WASM_IMPORT("escape")
void escape(void* x);


WASM_EXPORT("allocateOnStackAndSleep")
void allocateOnStackAndSleep() {
  // Allocate 4 bytes on stack. (The stack is always required to be aligned to
  // 16 bytes so we'll bump the stack pointer by 16.)
  int x[] = {7};
  // Force the compiler to store x on the spill stack
  escape(x);
  // Let victim allocate its stack space
  sleep(0);
  // Now we will reset the stack pointer in the epilogue
}

WASM_EXPORT("victim")
void victim() {
  // Allocate our string on stack below the 16 bytes allocated by
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
