'use client';

import { createContext } from "react";
import { io } from "socket.io-client";

export const socket = io(
    'http://localhost:8080', 
    { 
        autoConnect: true,
        withCredentials: true,
        transports: ['websocket']
    }
);

export const SocketContext = createContext(socket);