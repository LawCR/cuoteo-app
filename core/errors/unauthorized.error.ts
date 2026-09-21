import { AppError } from "@/core/errors/app-error";

// Acción no permitida para el usuario actual (403: hay sesión, sin permiso).
export class UnauthorizedError extends AppError {
  readonly code = "UNAUTHORIZED";
  readonly httpStatus = 403;
}