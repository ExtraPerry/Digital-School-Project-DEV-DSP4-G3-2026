// Nil UUID — no real row will ever carry this ID, so a `id=neq.${NIL_UUID}`
// filter is the "every row in this table" subscription idiom required by
// useSupabaseRealtime (whose filter field is mandatory).
export const NIL_UUID = "00000000-0000-0000-0000-000000000000";
