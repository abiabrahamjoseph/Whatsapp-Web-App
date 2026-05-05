import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

let sock;
let currentQR = '';
let connectionState = 'connecting';

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['Chrome', 'Windows', '110.0.5481.177'],
    logger: pino({ level: 'silent' }) // suppress logs for cleaner output
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      currentQR = await QRCode.toDataURL(qr);
      connectionState = 'qr';
      io.emit('qr', currentQR);
      io.emit('connection_state', connectionState);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
      connectionState = 'disconnected';
      io.emit('connection_state', connectionState);
      
      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        // If logged out, delete auth info
        console.log('Logged out. Please restart server or clear auth_info_baileys to get a new QR code.');
        try {
           fs.rmSync('auth_info_baileys', { recursive: true, force: true });
        } catch(e) {}
        currentQR = '';
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('opened connection');
      connectionState = 'connected';
      currentQR = '';
      io.emit('connection_state', connectionState);
    }
  });

  sock.ev.on('messages.upsert', async m => {
    console.log('got messages', m.messages);
    if (m.type === 'notify') {
      for (let msg of m.messages) {
        if (!msg.key.fromMe) {
          const from = msg.key.remoteJid;
          const pushName = msg.pushName || 'Unknown';
          
          let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
          let audioBase64 = null;
          let msgType = 'text';

          if (msg.message?.audioMessage) {
            try {
              const buffer = await downloadMediaMessage(
                msg,
                'buffer',
                { },
                { logger: pino({ level: 'silent' }) }
              );
              audioBase64 = `data:${msg.message.audioMessage.mimetype};base64,${buffer.toString('base64')}`;
              msgType = 'audio';
              text = 'Voice Note';
            } catch (err) {
              console.error('Failed to download audio message:', err);
              text = '[Audio Message Failed to Download]';
            }
          } else if (!text) {
             text = '[Media/Unsupported]';
          }
          
          io.emit('message', {
            id: msg.key.id,
            from: from.split('@')[0],
            name: pushName,
            text: text,
            msgType: msgType,
            audio: audioBase64,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          });
        }
      }
    }
  });
}

connectToWhatsApp();

io.on('connection', (socket) => {
  console.log('Client connected to socket');
  socket.emit('connection_state', connectionState);
  if (connectionState === 'qr' && currentQR) {
    socket.emit('qr', currentQR);
  }

  socket.on('request_qr', () => {
    if (connectionState === 'qr' && currentQR) {
      socket.emit('qr', currentQR);
    }
  });
});

// Endpoint to send message
app.post('/api/send-message', async (req, res) => {
  if (connectionState !== 'connected') {
    return res.status(400).json({ error: 'WhatsApp not connected' });
  }

  const { to, text } = req.body;
  if (!to || !text) {
    return res.status(400).json({ error: 'Missing "to" or "text"' });
  }

  try {
    const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    const msg = await sock.sendMessage(jid, { text });
    res.json({ success: true, messageId: msg.key.id });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Endpoint to send audio
app.post('/api/send-audio', async (req, res) => {
  if (connectionState !== 'connected') {
    return res.status(400).json({ error: 'WhatsApp not connected' });
  }

  const { to, audioBase64 } = req.body;
  if (!to || !audioBase64) {
    return res.status(400).json({ error: 'Missing "to" or "audioBase64"' });
  }

  try {
    const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const msg = await sock.sendMessage(jid, { 
      audio: buffer, 
      mimetype: 'audio/mp4', // Baileys typically prefers this or ogg for ptt
      ptt: true 
    });
    res.json({ success: true, messageId: msg.key.id });
  } catch (error) {
    console.error('Error sending audio:', error);
    res.status(500).json({ error: 'Failed to send audio' });
  }
});

// Endpoint to delete session (Disconnect)
app.post('/api/disconnect', async (req, res) => {
  if (sock) {
    sock.logout();
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
