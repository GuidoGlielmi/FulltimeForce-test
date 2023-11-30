export class FetchResponse<
  TData,
  TError extends boolean,
  TCode extends number | undefined = undefined,
> {
  public message: TFetchMessage;
  constructor(
    public data: TData,
    public error: TError,
    public code?: TCode,
  ) {
    this.data = data;
    this.error = error;
    this.code = code;
    this.message = error ? 'Ha ocurrido un error' : '';
  }
}
