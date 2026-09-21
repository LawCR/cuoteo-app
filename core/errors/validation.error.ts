import { AppError } from "@/core/errors/app-error";

// Input inválido detectado en el service — no reemplaza el parseo de Zod
// en el schema, es para reglas de negocio que Zod no puede expresar
export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  readonly httpStatus = 400;
}