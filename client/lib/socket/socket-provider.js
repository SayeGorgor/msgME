'use client';

import { SocketContext, socket } from "./socket";

export default function SocketProvider({children}) {
    return(
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}