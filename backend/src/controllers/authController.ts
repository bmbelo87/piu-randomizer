import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../database/prisma";

export async function register(req: Request, res:Response) {
    try {
        const {username, email, password} = req.body;

        const userExists = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (userExists) {
            return res.status(400).json({
                error: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username, 
                email,
                password: hashedPassword
            }
        });

        return res.json(user);

    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(400).json({
                error: "Invalid credentials"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(400).json({
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user.id
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "7d"
            }
        );

        return res.json({
            token, 
            user: {
                id: user.id,
                username:user.username,
                email: user.email
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}