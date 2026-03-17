export const logger = {
  info: (event: string, data: Record<string, unknown> = {}) => {
    console.info(JSON.stringify({ level: 'info', event, ...data }));
  },
  error: (event: string, data: Record<string, unknown> = {}) => {
    console.error(JSON.stringify({ level: 'error', event, ...data }));
  }
};
