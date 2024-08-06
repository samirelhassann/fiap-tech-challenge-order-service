import { UseCaseError } from "./UseCaseError";

export class InternalServerError extends Error implements UseCaseError {
  details?: string[];

  constructor(message: string, details?: string[]) {
    super(message);
    this.details = details;
  }
}
