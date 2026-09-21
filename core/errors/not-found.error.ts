import { AppError } from "@/core/errors/app-error";

// Recurso inexistente
export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";
  readonly httpStatus = 404;
}