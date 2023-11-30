import {CancelController} from './CancelController';

export async function tryFetch(
  url: string,
  options?: RequestInit,
  cancelController?: CancelController,
  retries = 3,
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
      if (err.name !== 'AbortError') throw err;
      remainingTries--;
    } finally {
      clearTimeout(timer);
    }
  }
}
