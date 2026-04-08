let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: '*', // For production, specify allowed origins
        methods: ['GET', 'POST']
      }
    });
    console.log('[SOCKET] System Initialized.');
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  }
};
