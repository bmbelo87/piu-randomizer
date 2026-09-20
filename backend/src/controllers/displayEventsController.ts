import { Request, Response } from "express";

const clients = new Set<Response>();

export function streamDisplayEvents(req: Request, res: Response) {
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
    });
    res.flushHeaders();
    res.write(": connected\n\n");

    clients.add(res);

    const heartbeat = setInterval(() => res.write(": ping\n\n"), 25000);

    req.on("close", () => {
        clearInterval(heartbeat);
        clients.delete(res);
    });
}

export function publishDisplayEvent(req: Request, res: Response) {
    const payload = `data: ${JSON.stringify(req.body ?? {})}\n\n`;

    for (const client of clients) {
        client.write(payload);
    }

    return res.status(204).end();
}
