import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError as ClassValidationError } from "class-validator";
import type { ClassConstructor } from "class-transformer";
import { ValidationError } from "../errors";

type TargetKey = "body" | "query" | "params";

const defaultKey: TargetKey = "body";

export function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  target: TargetKey = defaultKey
) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const raw = req[target];
    const instance = plainToInstance(dtoClass, raw, {
      enableImplicitConversion: true,
      excludeExtraneousValues: false,
    });

    const errors = await validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      next(new ValidationError("Validation failed", formatValidationErrors(errors)));
      return;
    }

    (req as Request & { [K in TargetKey]: T })[target] = instance;
    next();
  };
}

export function validateBody<T extends object>(dtoClass: ClassConstructor<T>) {
  return validateDto(dtoClass, "body");
}

function formatValidationErrors(errors: ClassValidationError[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const err of errors) {
    const key = err.property;
    const messages =
      err.constraints !== undefined ? Object.values(err.constraints) : [];
    if (err.children && err.children.length > 0) {
      const nested = formatValidationErrors(err.children);
      for (const [childKey, childMessages] of Object.entries(nested)) {
        result[`${key}.${childKey}`] = childMessages;
      }
    }
    if (messages.length > 0) {
      result[key] = (result[key] ?? []).concat(messages);
    }
  }
  return result;
}
