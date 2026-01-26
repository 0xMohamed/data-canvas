export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly status: number;
  public readonly code: AppErrorCode;
  public readonly details?: unknown;

  constructor(params: {
    status: number;
    code: AppErrorCode;
    message: string;
    details?: unknown;
  }) {
    super(params.message);

    this.name = "AppError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;

    Error.captureStackTrace?.(this, AppError);
  }
}
