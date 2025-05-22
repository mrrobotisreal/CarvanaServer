export const toCursor = (id: string) => Buffer.from(id).toString('base64');
export const fromCursor = (cursor?: string) =>
  cursor ? Buffer.from(cursor, 'base64').toString('ascii') : undefined;
