export const parseOrigins = (origins: string): string[] => {
  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin);
};
