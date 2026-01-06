import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { authApiService } from '../api/auth';
import { config } from '../../config/env';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineCount: number;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineCount: 0,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineCount, setOnlineCount] = useState<number>(0);

    useEffect(() => {
        const token = authApiService.getToken();
        const socketUrl = config.api.baseUrl.replace('/api', ''); // Get base URL without /api

        const newSocket = io(socketUrl, {
            auth: {
                token: token || undefined
            },
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('✅ Connected to WebSocket');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket');
            setIsConnected(false);
        });

        newSocket.on('online_count', (data: { count: number }) => {
            setOnlineCount(data.count);
        });

        newSocket.on('connect_error', (error) => {
            console.error('⚠️ WebSocket connection error:', error.message);
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [authApiService.isAuthenticated()]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineCount }}>
            {children}
        </SocketContext.Provider>
    );
};
