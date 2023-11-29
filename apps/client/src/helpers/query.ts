export type TQuery = {[key: string]: string | number};

export const queryStringifier = (query?: TQuery) => {
  return query
    ? '?' + Object.entries(query).reduce<string>((p, [k, v]) => `${p}${k}=${v}`, '')
    : '';
};
