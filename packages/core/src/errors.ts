// Define ErrorOptions type for compatibility with older Node versions
interface ErrorOptions {
  cause?: unknown;
}

export class RetryableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message);
    if (options?.cause) {
      // For older Node versions that don't support options in Error constructor
      Object.defineProperty(this, 'cause', {
        value: options.cause,
        configurable: true,
        writable: true,
      });
    }
    this.name = this.constructor.name;
  }
}

export class AbortError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message);
    if (options?.cause) {
      Object.defineProperty(this, 'cause', {
        value: options.cause,
        configurable: true,
        writable: true,
      });
    }
    this.name = this.constructor.name;
  }
}

export class ParseError extends RetryableError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

export class TimeoutError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message);
    if (options?.cause) {
      Object.defineProperty(this, 'cause', {
        value: options.cause,
        configurable: true,
        writable: true,
      });
    }
    this.name = this.constructor.name;
  }
}
