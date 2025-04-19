const socketIO = require('socket.io');

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://192.168.163.3:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Store active users
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user joining
    socket.on('join', ({ userId, role }) => {
      activeUsers.set(socket.id, { userId, role });
      console.log(`User ${userId} (${role}) joined`);
    });

    // Handle new reply
    socket.on('newReply', ({ doubtId, reply, senderId }) => {
      // Broadcast the new reply to all users in the doubt room
      io.emit(`doubt:${doubtId}`, { reply, senderId });
    });

    // Handle doubt status update
    socket.on('doubtStatusUpdate', ({ doubtId, status }) => {
      io.emit(`doubt:${doubtId}:status`, { status });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        console.log(`User ${user.userId} (${user.role}) disconnected`);
        activeUsers.delete(socket.id);
      }
    });
  });

  return io;
}

module.exports = initializeSocket; 