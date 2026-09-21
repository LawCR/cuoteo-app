import { AppError } from "@/core/errors/app-error";

// Estado o unicidad incompatible (username, solicitud pending, fantasma duplicado).
export class ConflictError extends AppError {
  readonly code = "CONFLICT";
  readonly httpStatus = 409;
}