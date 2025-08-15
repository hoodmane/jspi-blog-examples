(module
  (type $zero_args (func (result i32)))
  (type $one_args (func (param i32) (result i32)))
  (type $two_args (func (param i32 i32) (result i32)))

  (import "env" "__indirect_function_table" (table $functable 1 funcref))

  (func (export "countArgs") (param $funcptr i32) (result i32)
        (local $funcref funcref)
    ;; Convert function pointer to function reference using table.get, store the
    ;; result into $funcref local
    local.get $funcptr
    table.get $functable
    local.tee $funcref

    ;; Two args?
    ref.test (ref $two_args)
    if
      i32.const 2
      return
    end
    local.get $funcref

    ;; One arg?
    ref.test (ref $one_args)
    if
      i32.const 1
      return
    end
    local.get $funcref

    ;; Zero arg?
    ref.test (ref $zero_args)
    if
      i32.const 0
      return
    end

    ;; It takes more than two args, or uses a non-i32 type.
    i32.const -1
    return
  )
)