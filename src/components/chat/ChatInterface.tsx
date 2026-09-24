import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ChatMessage, ChatChannel } from '../../types';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Wrench, 
  Boxes, 
  Receipt, 
  Radio, 
  AlertTriangle, 
  Search, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Hash, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';
import { playNotificationChime } from '../../utils/audioChime';

export interface ChatInterfaceProps {
  variant?: 'embedded' | 'full' | 'compact';
  defaultChannel?: ChatChannel;
  onClose?: () => void;
  className?: string;
  prefillPlate?: string;
}

interface ConnectedUserPresence {
  employeeId: string;
  name: string;
  role: string;
  lastActive: string;
}

const CHANNELS: Array<{
  id: ChatChannel;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
}> = [
  {
    id: 'general',
    name: 'Umum & Koordinasi',
    description: 'Pengumuman shift, SOP kerja & koordinasi umum bengkel',
    icon: Radio,
    badgeColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800'
  },
  {
    id: 'service-bay',
    name: 'Pit & Mekanik',
    description: 'Update pengerjaan pit 1-4, instruksi perbaikan & diagnosa',
    icon: Wrench,
    badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
  },
  {
    id: 'spareparts',
    name: 'Gudang Sparepart',
    description: 'Cek stok, permintaan part mendesak & restock suku cadang',
    icon: Boxes,
    badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'front-desk',
    name: 'Front Desk & Kasir',
    description: 'Kedatangan pelanggan, estimasi biaya & approval invoice',
    icon: Receipt,
    badgeColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800'
  }
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  variant = 'embedded',
  defaultChannel = 'general',
  onClose,
  className = '',
  prefillPlate
}) => {
  const { currentEmployee, employees, services } = useWorkshop();

  // Selected Channel
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel>(defaultChannel);

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachedPlate, setAttachedPlate] = useState<string>(prefillPlate || '');

  // Real-time presence from server
  const [onlineUsers, setOnlineUsers] = useState<ConnectedUserPresence[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  // UI helpers
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(variant === 'full');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active motorcycle plates in workshop for quick attachment
  const activePlates = useMemo(() => {
    return services
      .filter(s => s.status !== 'Diambil')
      .map(s => ({ plate: s.plateNumber, model: s.motorModel, orderNo: s.orderNumber }))
      .slice(0, 8);
  }, [services]);

  // Connect WebSocket & subscribe to real-time events
  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let isCancelled = false;

    const connectWebSocket = () => {
      if (isCancelled) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isCancelled) return;
          setWsConnected(true);
          // Send join presence event
          ws.send(JSON.stringify({
            type: 'user:join',
            payload: {
              employeeId: currentEmployee.id,
              name: currentEmployee.name,
              role: currentEmployee.role
            }
          }));
        };

        ws.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'init:state') {
              if (Array.isArray(data.payload.messages)) {
                setMessages(data.payload.messages);
              }
              if (Array.isArray(data.payload.onlineUsers)) {
                setOnlineUsers(data.payload.onlineUsers);
              }
            } else if (data.type === 'presence:update') {
              if (Array.isArray(data.payload)) {
                setOnlineUsers(data.payload);
              }
            } else if (data.type === 'chat:message') {
              const newMsg: ChatMessage = data.payload;
              setMessages(prev => {
                // Deduplicate by id
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });

              // Audio notification if not sent by current user
              if (newMsg.senderId !== currentEmployee.id && soundEnabled) {
                if (newMsg.isUrgent) {
                  playNotificationChime('alert');
                } else {
                  playNotificationChime('dingdong');
                }
              }
            } else if (data.type === 'typing:indicator') {
              const { name, isTyping } = data.payload;
              setTypingUsers(prev => {
                if (isTyping) {
                  return prev.includes(name) ? prev : [...prev, name];
                } else {
                  return prev.filter(n => n !== name);
                }
              });
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onclose = () => {
          if (isCancelled) return;
          setWsConnected(false);
          // Reconnect with backoff
          reconnectTimer = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          setWsConnected(false);
          ws.close();
        };
      } catch (err) {
        console.error('WS Connection error:', err);
        reconnectTimer = setTimeout(connectWebSocket, 4000);
      }
    };

    connectWebSocket();

    // Fallback REST fetch if WebSocket initial state has delay
    fetch('/api/chat/messages')
      .then(res => res.json())
      .then((data: ChatMessage[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(prev => (prev.length === 0 ? data : prev));
        }
      })
      .catch(() => {});

    fetch('/api/chat/presence')
      .then(res => res.json())
      .then((users: ConnectedUserPresence[]) => {
        if (Array.isArray(users) && users.length > 0) {
          setOnlineUsers(users);
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentEmployee.id, currentEmployee.name, currentEmployee.role, soundEnabled]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChannel]);

  // Handle send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const trimmed = inputText.trim();
    const payload = {
      senderId: currentEmployee.id,
      senderName: currentEmployee.name,
      senderRole: currentEmployee.role,
      senderAvatar: currentEmployee.avatarUrl,
      content: trimmed,
      channel: selectedChannel,
      servicePlateNumber: attachedPlate ? attachedPlate.trim() : undefined,
      isUrgent
    };

    // Send via WebSocket if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat:send',
        payload
      }));
    } else {
      // REST fallback
      fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then((newMsg: ChatMessage) => {
          setMessages(prev => [...prev, newMsg]);
        })
        .catch(err => console.error('Failed to post message:', err));
    }

    // Reset input fields
    setInputText('');
    setIsUrgent(false);
    setAttachedPlate('');

    // Clear typing
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing:status',
        payload: { name: currentEmployee.name, isTyping: false }
      }));
    }
  };

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInputText(e.target.value);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing:status',
        payload: { name: currentEmployee.name, isTyping: true }
      }));

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'typing:status',
            payload: { name: currentEmployee.name, isTyping: false }
          }));
        }
      }, 2000);
    }
  };

  // Filter messages by channel and search
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const matchChannel = msg.channel === selectedChannel;
      if (!matchChannel) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        msg.content.toLowerCase().includes(q) ||
        msg.senderName.toLowerCase().includes(q) ||
        msg.senderRole.toLowerCase().includes(q) ||
        (msg.servicePlateNumber && msg.servicePlateNumber.toLowerCase().includes(q))
      );
    });
  }, [messages, selectedChannel, searchQuery]);

  // Unread count per channel
  const channelUnreads = useMemo(() => {
    const counts: Record<ChatChannel, number> = {
      'general': 0,
      'service-bay': 0,
      'spareparts': 0,
      'front-desk': 0
    };
    messages.forEach(m => {
      if (m.channel !== selectedChannel && m.isUrgent) {
        counts[m.channel] = (counts[m.channel] || 0) + 1;
      }
    });
    return counts;
  }, [messages, selectedChannel]);

  // Helper: check if an employee is currently connected via WebSocket
  const isEmployeeOnline = (empId: string, empName: string) => {
    return onlineUsers.some(u => 
      u.employeeId === empId || 
      u.name.toLowerCase() === empName.toLowerCase() ||
      (empId === currentEmployee.id)
    );
  };

  return (
    <div 
      className={`rounded-3xl border border-sky-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xl backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-200 ${
        isExpanded 
          ? 'fixed inset-4 sm:inset-8 z-50 shadow-2xl' 
          : variant === 'compact'
          ? 'h-[460px]'
          : 'h-[620px]'
      } ${className}`}
    >
      
      {/* 1. TOP HEADER BAR */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-sky-100 dark:border-slate-800/80 bg-gradient-to-r from-sky-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white shadow-sm">
            <MessageSquare className="h-4 w-4" />
            <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
              wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Komunikasi Tim Bengkel</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold border border-sky-300/60 dark:border-sky-500/30">
                  REAL-TIME
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span>{wsConnected ? 'Server Terhubung • Siap Kirim Pesan' : 'Menghubungkan ke Saluran Pit...'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                {onlineUsers.length + 1} Karyawan Online
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
              soundEnabled
                ? 'border-sky-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 bg-sky-50/80 dark:bg-slate-800'
                : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
            title={soundEnabled ? 'Matikan nada dering obrolan' : 'Nyalakan nada dering obrolan'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          {/* Members presence drawer toggle */}
          <button
            type="button"
            onClick={() => setShowMembersDrawer(!showMembersDrawer)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              showMembersDrawer
                ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-sky-300'
            }`}
            title="Lihat status kehadiran tim karyawan"
          >
            <Users className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Status Tim</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              {onlineUsers.length + 1}
            </span>
          </button>

          {/* Expand / Collapse toggle */}
          {variant !== 'compact' && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 hover:border-sky-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={isExpanded ? 'Kecilkan tampilan' : 'Perbesar jendela obrolan'}
            >
              {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          )}

          {/* Close button if modal/provided */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. CHANNELS TAB STRIP */}
      <div className="px-3 py-2 border-b border-sky-100 dark:border-slate-800/70 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {CHANNELS.map(ch => {
            const Icon = ch.icon;
            const isCurrent = selectedChannel === ch.id;
            const unread = channelUnreads[ch.id];

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChannel(ch.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-sky-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                <span>{ch.name}</span>
                {unread > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold px-1 animate-pulse">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative shrink-0 hidden md:block">
          <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pesan / plat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 pr-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 w-36 focus:w-48 transition-all focus:outline-none focus:border-sky-400"
          />
        </div>
      </div>

      {/* 3. MAIN BODY (MESSAGES + SLIDE-IN MEMBERS DRAWER) */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* MESSAGES LIST AREA */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-950/20">
          
          {/* Channel Header Banner */}
          <div className="px-4 py-2 border-b border-sky-50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 font-medium">
              <Hash className="h-3 w-3 text-sky-500" />
              <span>Saluran: <strong className="text-slate-800 dark:text-slate-200">{CHANNELS.find(c => c.id === selectedChannel)?.name}</strong></span>
              <span className="hidden sm:inline text-slate-400">— {CHANNELS.find(c => c.id === selectedChannel)?.description}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {filteredMessages.length} Pesan
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-500 mb-2">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada percakapan di saluran ini</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-0.5">
                  Mulai kirimkan pesan koordinasi, instruksi servis, atau pengecekan suku cadang ke tim.
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.senderId === currentEmployee.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in fade-in duration-150`}
                  >
                    {/* Sender Identity & Role Pill */}
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {isMe ? 'Anda' : msg.senderName}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-semibold border ${
                        msg.senderRole === 'Super Admin'
                          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/40'
                          : msg.senderRole === 'Kepala Bengkel'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/40'
                          : msg.senderRole.includes('Mekanik')
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/40'
                          : 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300/40'
                      }`}>
                        {msg.senderRole}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                      {msg.isUrgent && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px] font-extrabold animate-pulse">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          MENDESAK
                        </span>
                      )}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 shadow-xs text-xs relative ${
                        isMe
                          ? msg.isUrgent
                            ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white rounded-tr-none'
                            : 'bg-gradient-to-br from-sky-600 to-blue-600 text-white rounded-tr-none'
                          : msg.isUrgent
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400/80 text-rose-950 dark:text-rose-100 rounded-tl-none'
                          : 'bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {/* Attached Motorcycle Plate Tag */}
                      {msg.servicePlateNumber && (
                        <div className={`mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold tracking-wider ${
                          isMe
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-300/60 dark:border-sky-700'
                        }`}>
                          <Wrench className="h-3 w-3" />
                          <span>PLAT: {msg.servicePlateNumber}</span>
                        </div>
                      )}

                      {/* Content Text */}
                      <p className="leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {/* Live Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 italic animate-pulse">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                </span>
                <span>{typingUsers.join(', ')} sedang mengetik...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Motorcycle Plate Suggestions */}
          {activePlates.length > 0 && (
            <div className="px-4 py-1.5 bg-slate-100/70 dark:bg-slate-900/80 border-t border-slate-200/70 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Wrench className="h-2.5 w-2.5 text-sky-500" />
                <span>Tag Plat:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {activePlates.map(item => (
                  <button
                    key={item.plate}
                    type="button"
                    onClick={() => setAttachedPlate(attachedPlate === item.plate ? '' : item.plate)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      attachedPlate === item.plate
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-400'
                    }`}
                  >
                    {item.plate}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT FORM BAR */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-slate-900 border-t border-sky-100 dark:border-slate-800 flex flex-col gap-2"
          >
            {/* Options strip (Urgent Toggle & Attached Plate Badge) */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUrgent(!isUrgent)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isUrgent
                      ? 'bg-rose-500 text-white shadow-xs animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600'
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>Prioritas Mendesak</span>
                </button>

                {attachedPlate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-300 text-sky-700 dark:text-sky-300 text-[10px] font-mono font-bold">
                    <span>Plat: {attachedPlate}</span>
                    <button 
                      type="button" 
                      onClick={() => setAttachedPlate('')}
                      className="text-slate-400 hover:text-slate-700 ml-1 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Tekan <strong>Enter</strong> untuk kirim, <strong>Shift+Enter</strong> baris baru
              </span>
            </div>

            {/* Input and Send button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Tulis pesan ke saluran #${CHANNELS.find(c => c.id === selectedChannel)?.name}...`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                  !inputText.trim()
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
                    : isUrgent
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
          </form>

        </div>

        {/* SLIDE-IN / FIXED MEMBERS PRESENCE DRAWER */}
        {showMembersDrawer && (
          <div className="w-64 sm:w-72 border-l border-sky-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 flex flex-col z-20 shadow-lg animate-in slide-in-from-right-4 duration-200">
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-white">Status Kehadiran Tim</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMembersDrawer(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* List of employees */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Karyawan Terdaftar ({employees.length})
              </div>

              {employees.map(emp => {
                const isOnline = isEmployeeOnline(emp.id, emp.name);
                const isMe = emp.id === currentEmployee.id;

                return (
                  <div 
                    key={emp.id}
                    className={`p-2 rounded-xl border transition-all flex items-center justify-between ${
                      isMe
                        ? 'border-sky-300 bg-sky-50/70 dark:bg-sky-950/40 dark:border-sky-800'
                        : isOnline
                        ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                        : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Status Avatar Indicator */}
                      <div className="relative shrink-0">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                          {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                          isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {emp.name}
                          </span>
                          {isMe && (
                            <span className="px-1 py-0.2 rounded bg-sky-500 text-white text-[8px] font-bold">
                              SAYA
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                          {emp.role}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isOnline
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : emp.status === 'Bertugas'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {isOnline ? 'ONLINE' : emp.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom info banner */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 text-center">
              Sinkronisasi WebSocket Aktif
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
