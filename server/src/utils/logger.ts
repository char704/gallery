type LogMetadata = Record<string, unknown>;

export const logger = {
  info(message: string, metadata?: LogMetadata) {
    console.info(message, metadata ?? "");
  },
  warn(message: string, metadata?: LogMetadata) {
    console.warn(message, metadata ?? "");
  },
  error(message: string, metadata?: LogMetadata) {
    console.error(message, metadata ?? "");
  }
};
