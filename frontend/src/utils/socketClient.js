import { io } from 'socket.io-client';
import { getSocketBaseUrl } from './urls';

let socket = null;
let activeToken = null;
let referenceCount = 0;

const createSocket = (token) => {
    activeToken = token;
    socket = io(getSocketBaseUrl(), {
        auth: { token },
        path: '/socket.io'
    });
    return socket;
};

export const acquireSocket = (token) => {
    if (!token) {
        return null;
    }

    if (!socket) {
        createSocket(token);
    } else if (activeToken !== token) {
        socket.disconnect();
        createSocket(token);
    }

    referenceCount += 1;
    return socket;
};

export const releaseSocket = (instance) => {
    if (!socket || instance !== socket) {
        return;
    }

    referenceCount = Math.max(0, referenceCount - 1);

    if (referenceCount === 0) {
        socket.disconnect();
        socket = null;
        activeToken = null;
    }
};
