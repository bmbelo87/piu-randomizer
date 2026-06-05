import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    id: string;
}

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Token missing"
            });
        }

        const [, token] = authHeader.split(" ");

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as TokenPayload;

        (req as any).userId = decoded.id;

        next();

    } catch (error) {
        return res.status(401).json({
            error: "Invalid token"
        });
    }
}