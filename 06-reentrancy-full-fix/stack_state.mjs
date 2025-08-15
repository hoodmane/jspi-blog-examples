/**
 * Stack layout for a thread (diagram stolen from greenlet).
 *
 *               |     ^^^       |
 *               |  older data   |
 *               |               |
 *  stack_stop . |_______________|
 *        .      |               |
 *        .      |     data      |
 *        .      |   in stack    |
 *        .    * |_______________| . .  _____________  stack_start + _copy.length
 *        .      |               |     |             |
 *        .      |     data      |     |  data saved |
 *        .      |   for next    |     |  in _copy   |
 *               | thread  |     |             |
 * stack_start . |               | . . |_____________| stack_start
 *               |               |
 *               |  newer data   |
 *               |     vvv       |
 *
 * Each thread has some part (possibly none) of its argument stack data at the
 * correct place on the actual stack and some part (possibly none) that has been
 * evicted to _copy by some other thread that needed the space.
 */

/**
 * This is a list of threads that have some of their state in the stack. We need
 * to keep track of them because restore() may need to evict them from the stack
 * in which case it will have to save their data.
 *
 * Invariants:
 * 1. This list contains a StackState for every thread that at least partially
 *    on the argument stack except the currently executing one. The `StackState`
 *    adds the currently executing thread to this list when we suspend.
 * 2. The entries are sorted. Earlier entries occupy space further up on the
 *    stack, later entries occupy space lower down on the stack.
 */
const stackStates = [];

/**
 * A class to help us keep track of the stack data for our individual threads.
 *
 * We only expose `restore` which ensures that the arg stack data is restored to
 * its proper location and that the data from other threads that are evicted and
 * properly stored.
 */
export class StackState {
  constructor(stackTop, stackBottom) {
    /** current stack pointer */
    this.stackBottom = stackBottom;
    /**
     * The value the stack pointer had when we entered Python. This is how far
     * up the stack the current thread cares about. This was recorded just
     * before we entered Python in suspendableApply.
     */
    this.stackTop = stackTop;
    /**
     * Where we store the data if it gets ejected from the actual argument
     * stack.
     */
    this._copy = new Uint8Array(0);
    if (this.stackBottom !== this.stackTop) {
      // Edge case that probably never happens: If start and stop are equal, the
      // current thread occupies no arg stack space.
      stackStates.push(this);
    }
  }

  /**
   * Restore the argument stack in preparation to run the thread.
   */
  restore(HEAP) {
    // Search up the stack for threads that need to be ejected in their entirety
    // and save them
    while (
      stackStates.length > 0 &&
      stackStates[stackStates.length - 1].stackTop < this.stackTop
    ) {
      stackStates.pop()._save(HEAP);
    }
    // Part of one more threads may need to be ejected.
    const last = stackStates[stackStates.length - 1];
    if (last && last !== this) {
      last._save_up_to(this.stackTop);
    }
    // If we just saved all of the last stackState it needs to be removed.
    // Alternatively, the current StackState may be on the stackStates list.
    // Technically it would make sense to leave it there, but we will add it
    // back if we suspend again and if we exit normally it gets removed from the
    // stack.
    if (last && last.stackTop === this.stackTop) {
      stackStates.pop();
    }
    if (this._copy.length !== 0) {
      // Now that we've saved everything that might be in our way we can restore
      // the current stack data if need be.
      HEAP.set(this._copy, this.stackBottom);
      this._copy = new Uint8Array(0);
    }
  }

  /**
   * Copy part of a stack frame into the _copy Uint8Array
   * @param {number} stop What part of the frame to copy
   */
  _save_up_to(HEAP, stop) {
    let sz1 = this._copy.length;
    let sz2 = stop - this.stackBottom;
    if (sz2 <= sz1) {
      return 0;
    }
    const new_segment = HEAP.subarray(this.stackBottom + sz1, this.stackBottom + sz2);
    const c = new Uint8Array(sz2);
    c.set(this._copy);
    c.set(new_segment, sz1);
    this._copy = c;
  }

  /**
   * Copy all of a stack frame into its _copy Uint8Array
   */
  _save(HEAP) {
    this._save_up_to(HEAP, this.stackTop);
  }
}
