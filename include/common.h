#define WASM_IMPORT(name) \
    __attribute__((import_module("env"), import_name(name)))

#define WASM_EXPORT(name) \
    __attribute__((export_name(name)))
