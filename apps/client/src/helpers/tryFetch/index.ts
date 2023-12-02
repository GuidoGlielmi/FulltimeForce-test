import {CancelController} from '../CancelController';
export const DEFAULT_RETRIES_AMOUNT = 3;
export async function tryFetch(
  url: string,
  options?: RequestInit,
  cancelController?: CancelController,
  retries = DEFAULT_RETRIES_AMOUNT,
) {
  let remainingTries = retries;
  const controller = cancelController || new CancelController();
  while (remainingTries > 0) {
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const result = await fetch(url, {...options, signal: controller.abortController.signal});
      return result;
    } catch (err: any) {
      console.log(err);
      if (err?.name !== 'AbortError') throw err;
      remainingTries--;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error('timed out');
}
