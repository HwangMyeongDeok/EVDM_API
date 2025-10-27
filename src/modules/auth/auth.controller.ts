import { Request, Response, NextFunction } from "express";
import AuthService from "./auth.service";

class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized request");

      const user = await AuthService.register(req.body, req.user);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
