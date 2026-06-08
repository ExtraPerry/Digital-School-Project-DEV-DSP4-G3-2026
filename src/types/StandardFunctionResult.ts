export type StandardFunctionResult<T> = {
  data: T,
  error?: undefined | null,
} | {
  data?: undefined | null,
  error: string | unknown,
}