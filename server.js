const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store users waiting for a partner
let waitingUsers = [];

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Pair users randomly
  if (waitingUsers.length > 0) {
    const partner = waitingUsers.pop();
    partner.emit('matched', socket.id); // Notify partner
    socket.emit('matched', partner.id); // Notify current user
  } else {
    waitingUsers.push(socket);
  }

  // Handle WebRTC signaling
  socket.on('signal', (data) => {
    io.to(data.target).emit('signal', data); // Forward signals
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
