import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";

interface UserPayload {
    id: string;
    email: string;
}

interface AuthenticatedSocket extends Socket {
    user?: UserPayload;
}
type NextFunction = (err?: Error) => void;
const socketAuth = ((socket: AuthenticatedSocket, next: NextFunction) => {

    try {

        const token =
            socket.handshake
                .auth.token;

        if (!token) {
            return next(
                new Error(
                    "Unauthorized"
                )
            );
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET!
            ) as UserPayload;

        socket.user = decoded;

        next();

    } catch (error) {

        next(
            new Error(
                "Unauthorized"
            )
        );
    }
});

export default socketAuth