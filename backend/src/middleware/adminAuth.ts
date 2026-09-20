import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function digest(value: string) {
    return crypto.createHash("sha256").update(value).digest();
}

/**
 * Protege as rotas que gravam dados com a senha de ADMIN_PASSWORD (header
 * x-admin-password). Leituras, inclusive o telao e o stream de eventos,
 * continuam publicas. Sem ADMIN_PASSWORD definida nada e bloqueado, como no
 * uso local.
 */
export function adminAuth(req: Request, res: Response, next: NextFunction) {
    const password = process.env.ADMIN_PASSWORD;

    if (!password || READ_ONLY_METHODS.has(req.method)) {
        return next();
    }

    const given = req.get("x-admin-password") ?? "";

    if (crypto.timingSafeEqual(digest(given), digest(password))) {
        return next();
    }

    return res.status(401).json({ error: "Unauthorized" });
}
