import {CancelError} from './CancelError';

export class CancelController {
  public abortController = new AbortController();

  abort(reason?: any) {
    this.abortController.abort(reason);
    this.abortController = new AbortController();
  }
  cancel() {
    this.abort(new CancelError());
  }
}
