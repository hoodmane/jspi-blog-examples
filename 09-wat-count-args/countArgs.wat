(module
  (type $zero_args (func (result i32)))
  (type $one_args (func (param i32) (result i32)))
  (type $two_args (func (param i32 i32) (result i32)))
  (import "env" "__indirect_function_table" (table $functable 1 funcref))
  (func (export "countArgs") (param $funcptr i32) (result i32)
        (local $funcref funcref)
    local.get $funcptr
    table.get $functable
    local.tee $funcref
    ref.test (ref $two_args)
    if
      i32.const 2
      return
    end
    local.get $funcref
    ref.test (ref $one_args)
    if
      i32.const 1
      return
    end
    local.get $funcref
    ref.test (ref $zero_args)
    if
      i32.const 0
      return
    end
    i32.const -1
    return
  )
)