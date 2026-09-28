export interface FieldError {
  field: string;
  message: string;
}

// Lets controllers `throw new ApiError(...)`; the global error handler reads
// statusCode/errors/code off it to build the response.
export class ApiError extends Error {
  statusCode: number;
  errors: FieldError[];
  code?: string;

  constructor(statusCode: number, message: string, errors: FieldError[] = [], code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
  }
}
