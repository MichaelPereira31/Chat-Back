/* eslint-disable no-param-reassign */
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { Server, Socket } from 'socket.io';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

app.use(express.json());

io.on('connection', (socket: Socket) => {
  socket.on('set_userName', (userName: string) => {
    socket.data.userName = userName;
  });
  socket.on('message', (message: string) => {
    io.emit('receivedMessage', {
      message,
      authorId: socket.id,
      author: socket.data.userName,
    });
  });
});

app.get('/homeVideo', (req, res) => {
  res.sendFile(`${__dirname}/videos.html`);
});

app.get('/video', (req, res) => {
  const { range } = req.headers;
  const videoPath = './video.mp4';
  const videoSize = fs.statSync(videoPath).size;

  const chunkSize = 1 * 1e6;
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + chunkSize, videoSize - 1);

  const contentLength = end - start + 1;

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };
  res.writeHead(206, headers);

  const stream = fs.createReadStream(videoPath, { start, end });
  stream.pipe(res);
});

server.listen(3333, () => console.log('Server is running on port 3333'));
