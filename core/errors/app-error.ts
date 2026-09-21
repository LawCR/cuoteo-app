// Clase base de la que heredan todos los errores tipados de la app.
// Nunca se lanza directamente — siempre una subclase concreta.
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  readonly meta?: Record<string, unknown>;

  constructor(message: string, meta?: Record<string, unknown>, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
    this.meta = meta;
    Error.captureStackTrace?.(this, this.constructor);
  }
}