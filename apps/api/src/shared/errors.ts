export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super(400, 'VALIDATION_ERROR', 'Requisicao invalida', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Nao autenticado') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(403, 'FORBIDDEN', message);
  }
}

export class LicenseExpiredError extends AppError {
  constructor() {
    super(403, 'LICENSE_EXPIRED', 'Licenca expirada');
  }
}

export class PreviewLimitedError extends AppError {
  constructor(feature: string) {
    super(403, 'PREVIEW_LIMITED', `Recurso "${feature}" indisponivel no modo preview`);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(404, 'NOT_FOUND', `${resource} nao encontrado`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super(429, 'RATE_LIMIT', 'Muitas requisicoes, tente novamente em instantes');
  }
}
