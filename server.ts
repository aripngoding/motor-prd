import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.json());

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  channel: 'service-bay' | 'spareparts' | 'front-desk' | 'general';
  serviceOrderId?: string;
  servicePlateNumber?: string;
  isUrgent?: boolean;
}

export interface ConnectedUser {
  employeeId: string;
  name: string;
  role: string;
  lastActive: string;
}

// In-memory server-authoritative store
const chatMessages: ChatMessage[] = [
  {
    id: 'msg-seed-1',
    senderId: 'EMP-002',
    senderName: 'Budi Prasetyo',
    senderRole: 'Senior Mechanic',
    content: 'Unit Yamaha NMAX B 3456 KAZ di Pit 1 perlu penggantian vanbelt dan roller 10gr. Tolong bagian gudang cek ketersediaan part.',
    timestamp: '08:45',
    channel: 'spareparts',
    serviceOrderId: 'SRV-1002',
    servicePlateNumber: 'B 3456 KAZ',
    isUrgent: false
  },
  {
    id: 'msg-seed-2',
    senderId: 'EMP-004',
    senderName: 'Dewi Lestari',
    senderRole: 'Staff Gudang Sparepart',
    content: 'Stok Vanbelt NMAX dan roller 10gr original Yamaha ready 8 set di Rak B-03. Sudah saya sisihkan untuk Pit 1 mas Budi.',
    timestamp: '08:48',
    channel: 'spareparts',
    serviceOrderId: 'SRV-1002',
    servicePlateNumber: 'B 3456 KAZ',
    isUrgent: false
  },
  {
    id: 'msg-seed-3',
    senderId: 'EMP-003',
    senderName: 'Rina Safitri',
    senderRole: 'Front Desk & Kasir',
    content: 'Customer Honda Beat B 6789 ABC konfirmasi minta sekalian bersihkan throttle body & ganti oli gardan. Estimasi selesai jam 11:00 ya.',
    timestamp: '09:12',
    channel: 'service-bay',
    serviceOrderId: 'SRV-1003',
    servicePlateNumber: 'B 6789 ABC',
    isUrgent: false
  },
  {
    id: 'msg-seed-4',
    senderId: 'EMP-001',
    senderName: 'Agus Santoso',
    senderRole: 'Kepala Bengkel',
    content: 'PERHATIAN: Pukul 13:00 ada kedatangan armada pengiriman sparepart rutin dari distributor resmi. Mohon tim gudang siapkan area loading dock.',
    timestamp: '09:30',
    channel: 'general',
    isUrgent: true
  },
  {
    id: 'msg-seed-5',
    senderId: 'EMP-ADMIN-01',
    senderName: 'Nurul Arif',
    senderRole: 'Super Admin',
    content: 'Target servis hari ini 25 unit motor. Jangan lupa SOP pengecekan tekanan angin ban & pelumasan kabel gas di setiap servis berkala.',
    timestamp: '09:35',
    channel: 'general',
    isUrgent: false
  }
];

// Active client connections map: WebSocket -> ConnectedUser
const connectedUsers = new Map<WebSocket, ConnectedUser>();

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws/chat' });

function broadcast(payload: unknown, excludeWs?: WebSocket) {
  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function getOnlineUsersList(): ConnectedUser[] {
  const users: ConnectedUser[] = [];
  const seenIds = new Set<string>();

  connectedUsers.forEach((user) => {
    if (!seenIds.has(user.employeeId)) {
      seenIds.add(user.employeeId);
      users.push(user);
    }
  });

  return users;
}

wss.on('connection', (ws: WebSocket) => {
  // Send initial history and online list
  ws.send(JSON.stringify({
    type: 'init:state',
    payload: {
      messages: chatMessages,
      onlineUsers: getOnlineUsersList()
    }
  }));

  ws.on('message', (rawMessage: string) => {
    try {
      const message = JSON.parse(rawMessage);

      if (message.type === 'user:join') {
        const user: ConnectedUser = {
          employeeId: message.payload.employeeId,
          name: message.payload.name,
          role: message.payload.role,
          lastActive: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        connectedUsers.set(ws, user);

        // Broadcast updated online presence
        broadcast({
          type: 'presence:update',
          payload: getOnlineUsersList()
        });
      }

      if (message.type === 'chat:send') {
        const payload = message.payload;
        if (!payload.content || !payload.content.trim()) return;

        const newChatMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          senderId: payload.senderId,
          senderName: payload.senderName,
          senderRole: payload.senderRole,
          senderAvatar: payload.senderAvatar,
          content: payload.content.trim(),
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          channel: payload.channel || 'general',
          serviceOrderId: payload.serviceOrderId || undefined,
          servicePlateNumber: payload.servicePlateNumber || undefined,
          isUrgent: Boolean(payload.isUrgent)
        };

        // Server authoritative store
        chatMessages.push(newChatMessage);
        if (chatMessages.length > 200) {
          chatMessages.shift(); // keep last 200 messages
        }

        // Broadcast new message to all clients
        broadcast({
          type: 'chat:message',
          payload: newChatMessage
        });
      }

      if (message.type === 'typing:status') {
        broadcast({
          type: 'typing:indicator',
          payload: message.payload
        }, ws);
      }

    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    connectedUsers.delete(ws);
    broadcast({
      type: 'presence:update',
      payload: getOnlineUsersList()
    });
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error:', err);
  });
});

// REST Fallback Endpoints for quick retrieval
app.get('/api/chat/messages', (req, res) => {
  const channel = req.query.channel as string;
  if (channel && channel !== 'all') {
    res.json(chatMessages.filter(m => m.channel === channel));
  } else {
    res.json(chatMessages);
  }
});

app.post('/api/chat/messages', (req, res) => {
  const { senderId, senderName, senderRole, content, channel, serviceOrderId, servicePlateNumber, isUrgent } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
  }

  const newChatMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    senderId,
    senderName,
    senderRole,
    content: content.trim(),
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    channel: channel || 'general',
    serviceOrderId,
    servicePlateNumber,
    isUrgent: Boolean(isUrgent)
  };

  chatMessages.push(newChatMessage);
  broadcast({
    type: 'chat:message',
    payload: newChatMessage
  });

  return res.json(newChatMessage);
});

app.get('/api/chat/presence', (_req, res) => {
  res.json(getOnlineUsersList());
});

// Setup Vite or Static File Serving
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[MotoRAD Server] Running on http://0.0.0.0:${PORT} with WebSocket chat server at /ws/chat`);
  });
}

startServer();
