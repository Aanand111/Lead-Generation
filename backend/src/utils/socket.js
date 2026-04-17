let io;
const users = new Map(); // Keep track of online users: userId -> set of socketIds

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: '*', // For production, specify allowed origins
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId;
      if (userId && userId !== 'undefined') {
        socket.join(userId);
        console.log(`[SOCKET] User ${userId} connected and joined room.`);
        
        if (!users.has(userId)) users.set(userId, new Set());
        users.get(userId).add(socket.id);

        socket.on('disconnect', () => {
          console.log(`[SOCKET] User ${userId} disconnected.`);
          users.get(userId)?.delete(socket.id);
          if (users.get(userId)?.size === 0) users.delete(userId);
        });
      }

      socket.on('ping', () => {
        socket.emit('pong');
      });
    });

    console.log('[SOCKET] System Initialized with Room Support.');
    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  },

  /**
   * Send notification to a specific user
   */
  sendToUser: (userId, event, data) => {
    if (io) {
      io.to(userId).emit(event, data);
    }
  },

  /**
   * Broadcast to everyone
   */
  broadcast: (event, data) => {
    if (io) {
      io.emit(event, data);
    }
  }
};
