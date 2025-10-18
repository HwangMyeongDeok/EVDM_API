import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err;

  if (!(err instanceof AppError)) {
    statusCode = 500;
    message = "Internal Server Error";
  }

  console.error(`[ErrorHandler] ${statusCode} - ${message}`);
  if (err.stack) {
    console.error("Stack trace:", err.stack);
  }
  res.status(statusCode).json({ error: { message, statusCode } });
};
