import { AppError } from "@/core/errors/app-error";

// Fallo de un proveedor externo (Clerk, Resend, etc.).
export class ExternalServiceError extends AppError {
  readonly code = "EXTERNAL_SERVICE_ERROR";
  readonly httpStatus = 502;

  constructor(service: string, message: string, options?: ErrorOptions) {
    super(`[${service}] ${message}`, { service }, options);
  }
}