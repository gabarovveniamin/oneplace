import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from './config/config';

interface SocketWithUser extends Socket {
    userId?: string;
}

class SocketManager {
    private io: Server | null = null;
    private userSockets: Map<string, string[]> = new Map();

    public init(server: HttpServer): void {
        this.io = new Server(server, {
            cors: {
                origin: '*', // In production, replace with specific origins
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.io.use((socket: SocketWithUser, next) => {
            const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            try {
                const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
                const decoded = jwt.verify(cleanToken, config.jwt.secret) as { userId: string };
                socket.userId = decoded.userId;
                next();
            } catch (err) {
                return next(new Error('Authentication error: Invalid token'));
            }
        });

        this.io.on('connection', (socket: SocketWithUser) => {
            const userId = socket.userId;
            if (userId) {
                console.log(`🔌 User connected: ${userId} (${socket.id})`);

                const existing = this.userSockets.get(userId) || [];
                this.userSockets.set(userId, [...existing, socket.id]);

                socket.on('disconnect', () => {
                    console.log(`🔌 User disconnected: ${userId} (${socket.id})`);
                    const updated = this.userSockets.get(userId)?.filter(id => id !== socket.id) || [];
                    if (updated.length === 0) {
                        this.userSockets.delete(userId);
                    } else {
                        this.userSockets.set(userId, updated);
                    }
                });
            }
        });
    }

    public sendToUser(userId: string, event: string, data: any): void {
        if (!this.io) return;

        const socketIds = this.userSockets.get(userId);
        if (socketIds && socketIds.length > 0) {
            socketIds.forEach(id => {
                this.io?.to(id).emit(event, data);
            });
            console.log(`📡 Event "${event}" sent to user ${userId}`);
        } else {
            console.log(`📡 User ${userId} is offline, event "${event}" not sent via socket`);
        }
    }

    public broadcast(event: string, data: any): void {
        if (!this.io) return;
        this.io.emit(event, data);
    }
}

export const socketManager = new SocketManager();
