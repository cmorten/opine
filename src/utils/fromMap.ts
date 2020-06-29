export const fromMap = (map: any) =>
  (Array.from(new Set(map.keys())) as any).reduce((obj: any, key: string) => {
    const value = map.get(key);

    return {
      ...obj,
      [key]: obj[key] ? ([obj[key], value]).flat() : value,
    };
  }, {});
