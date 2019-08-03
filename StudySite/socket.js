/**
 *
 */
const SocketIO = require('socket.io');
const axios = require('axios');

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: '/socket.io' });

  app.set('io', io);
  const chat = io.of('/chat');

  io.use((socket, next) => {
      sessionMiddleware(socket.request, socket.request.res, next);
  });

  chat.on('connection', (socket) => {
      console.log('chat 네임스페이스에 접속');
      const req = socket.request;
      const { headers: { referer } } = req;
      const roomId = referer
          .split('/')[referer.split('/').length - 1]
          .replace(/\?.+/, '');
      socket.join(roomId);

      let nickname;
      if (req.user) {
          nickname = req.user.nickanme;
      } else {
          nickname = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      }

      console.log(nickname + ' is connected');

      socket.to(roomId).emit('join', {
          user: 'system',
          content: nickname + 'is connnected !',
      });

      socket.on('disconnect', () => {
          console.log('chat 네임스페이스 접속 해제');
          socket.leave(roomId);
          const currentRoom = socket.adapter.rooms[roomId];
          const userCount = currentRoom ? currentRoom.length : 0;
          if (userCount === 0) {
            axios.delete('http://localhost:8001/customer/room/'+roomId)
            .then(() => {
              console.log('Success to send!');
            })
            .catch((error) => {
              console.error(error);
            });
          } else {
              socket.to(roomId).emit('exit', {
                user: 'system',
                chat: nickname + '님이 퇴장하셨습니다.',
              });
          }
      });
  });
};
