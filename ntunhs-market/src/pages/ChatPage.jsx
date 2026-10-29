import { useState, useEffect, useRef } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ── 時間格式化 ───────────────────────────────────────────
function formatTime(date) {
  if (!date) return '';
  const now = new Date();
  const diff = now - date;
  if (diff < 86400000) return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  if (diff < 172800000) return '昨天';
  return date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
}

// ── 頭像 ────────────────────────────────────────────────
function Avatar({ name = '?', size = 40, bg = '#0ea5e9' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.4, flexShrink: 0,
    }}>
      {name.charAt(0) || '?'}
    </div>
  );
}

// ── 主組件 ───────────────────────────────────────────────
export default function ChatPage({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── 1. 即時載入對話列表 ────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );
    const unsub = onSnapshot(q, snapshot => {
      setConversations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user?.uid]);

  // ── 2. 即時載入選中對話的訊息 ─────────────────────────
  useEffect(() => {
    if (!selectedConv?.id) { setMessages([]); return; }
    setLoadingMsgs(true);
    const q = query(
      collection(db, 'conversations', selectedConv.id, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingMsgs(false);
      // 標記已讀
      updateDoc(doc(db, 'conversations', selectedConv.id), {
        [`unreadCounts.${user.uid}`]: 0
      }).catch(() => {});
    });
    return () => unsub();
  }, [selectedConv?.id, user?.uid]);

  // ── 3. 自動捲到最新訊息 ───────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── 4. 選對話時聚焦輸入框 ─────────────────────────────
  useEffect(() => {
    if (selectedConv) inputRef.current?.focus();
  }, [selectedConv?.id]);

  // ── 傳送訊息 ─────────────────────────────────────────
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !selectedConv || sending) return;
    setSending(true);
    setInputText('');
    try {
      await addDoc(
        collection(db, 'conversations', selectedConv.id, 'messages'),
        {
          senderId: user.uid,
          senderName: user.name || user.email?.split('@')[0] || '我',
          text,
          createdAt: serverTimestamp(),
        }
      );
      const otherUid = selectedConv.participants.find(p => p !== user.uid);
      const prevUnread = selectedConv.unreadCounts?.[otherUid] || 0;
      await updateDoc(doc(db, 'conversations', selectedConv.id), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        [`unreadCounts.${otherUid}`]: prevUnread + 1,
        [`unreadCounts.${user.uid}`]: 0,
      });
    } catch (e) {
      console.error('傳送失敗', e);
      setInputText(text); // 還原輸入
    }
    setSending(false);
  };

  // ── 未登入畫面 ────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>💬</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 8 }}>請先登入</p>
        <p style={{ fontSize: 14 }}>登入後才能查看聊天記錄與傳送訊息</p>
      </div>
    );
  }

  // ── 過濾對話 ─────────────────────────────────────────
  const filteredConvs = conversations.filter(c => {
    if (!searchText) return true;
    const otherUid = c.participants?.find(p => p !== user.uid);
    const otherName = c.participantNames?.[otherUid] || '';
    return otherName.includes(searchText) || (c.lastMessage || '').includes(searchText);
  });

  // 總未讀數
  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCounts?.[user.uid] || 0), 0
  );

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '28px 20px' }}>
      {/* 標題列 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>聊天室</h1>
        {totalUnread > 0 && (
          <span style={{ background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>
            {totalUnread} 則未讀
          </span>
        )}
        <p style={{ color: '#64748b', fontSize: 13, margin: 0, marginLeft: 4 }}>與賣家私訊聊天</p>
      </div>

      {/* 主面板 */}
      <div style={{
        display: 'flex', gap: 0, height: 620,
        border: '1px solid #e2e8f0', borderRadius: 20,
        overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,.06)',
        background: '#fff',
      }}>

        {/* ─ 左側：對話列表 ─────────────────────────────── */}
        <div style={{ width: 280, borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* 搜尋 */}
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
              <input
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="搜尋聊天室..."
                style={{
                  width: '100%', padding: '8px 10px 8px 30px',
                  border: '1.5px solid #e2e8f0', borderRadius: 10,
                  fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#f8fafc',
                }}
              />
            </div>
          </div>

          {/* 列表 */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConvs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                <p style={{ fontSize: 13 }}>
                  {searchText ? '找不到對話' : '尚無任何對話\n點選商品頁的「聯絡賣家」開始'}
                </p>
              </div>
            ) : filteredConvs.map(conv => {
              const otherUid = conv.participants?.find(p => p !== user.uid);
              const otherName = conv.participantNames?.[otherUid] || '未知用戶';
              const unread = conv.unreadCounts?.[user.uid] || 0;
              const isSelected = selectedConv?.id === conv.id;
              const ts = conv.lastMessageAt?.toDate?.();

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  style={{
                    padding: '14px 16px', cursor: 'pointer',
                    background: isSelected ? '#f0f9ff' : '#fff',
                    borderLeft: isSelected ? '3px solid #0ea5e9' : '3px solid transparent',
                    borderBottom: '1px solid #f8fafc',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background .12s',
                  }}
                >
                  <Avatar name={otherName} size={42} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: unread > 0 ? 700 : 600, fontSize: 14, color: '#1e293b' }}>
                        {otherName}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>
                        {ts ? formatTime(ts) : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                      <span style={{
                        fontSize: 12, color: unread > 0 ? '#475569' : '#94a3b8',
                        fontWeight: unread > 0 ? 600 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
                      }}>
                        {conv.lastMessage || '開始對話...'}
                      </span>
                      {unread > 0 && (
                        <span style={{
                          background: '#ef4444', color: '#fff',
                          fontSize: 11, fontWeight: 700,
                          padding: '2px 6px', borderRadius: 10,
                          minWidth: 18, textAlign: 'center', flexShrink: 0,
                        }}>
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─ 右側：訊息區 ──────────────────────────────── */}
        {selectedConv ? (() => {
          const otherUid = selectedConv.participants?.find(p => p !== user.uid);
          const otherName = selectedConv.participantNames?.[otherUid] || '未知用戶';
          return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Header */}
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#fafcff',
              }}>
                <Avatar name={otherName} size={40} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{otherName}</div>
                  <div style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    線上
                  </div>
                </div>
              </div>

              {/* 訊息列表 */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loadingMsgs ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', paddingTop: 40 }}>載入中…</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', paddingTop: 40 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
                    <p style={{ fontSize: 13 }}>傳送訊息開始對話吧！</p>
                  </div>
                ) : messages.map(msg => {
                  const isMe = msg.senderId === user.uid;
                  const ts = msg.createdAt?.toDate?.();
                  return (
                    <div key={msg.id} style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end', gap: 8,
                    }}>
                      {!isMe && <Avatar name={msg.senderName || otherName} size={32} />}
                      <div style={{ maxWidth: '65%' }}>
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : '#f1f5f9',
                          color: isMe ? '#fff' : '#1e293b',
                          fontSize: 14, lineHeight: 1.55, wordBreak: 'break-word',
                          boxShadow: isMe ? '0 2px 8px rgba(14,165,233,.25)' : 'none',
                        }}>
                          {msg.text}
                        </div>
                        {ts && (
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                            {formatTime(ts)}
                          </div>
                        )}
                      </div>
                      {isMe && <Avatar name={user.name || '我'} size={32} bg="#64748b" />}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 輸入區 */}
              <div style={{
                padding: '12px 16px', borderTop: '1px solid #f1f5f9',
                display: 'flex', gap: 10, alignItems: 'flex-end',
                background: '#fff',
              }}>
                <input
                  ref={inputRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                  }}
                  placeholder="輸入訊息… (Enter 傳送)"
                  style={{
                    flex: 1, padding: '10px 14px',
                    border: '1.5px solid #e2e8f0', borderRadius: 12,
                    fontSize: 14, outline: 'none', resize: 'none',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || sending}
                  style={{
                    padding: '10px 18px',
                    background: inputText.trim() && !sending
                      ? 'linear-gradient(135deg,#0ea5e9,#0284c7)'
                      : '#e2e8f0',
                    color: inputText.trim() && !sending ? '#fff' : '#94a3b8',
                    border: 'none', borderRadius: 12,
                    cursor: inputText.trim() && !sending ? 'pointer' : 'not-allowed',
                    fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'all .15s', whiteSpace: 'nowrap',
                  }}
                >
                  ✈ 傳送
                </button>
              </div>
            </div>
          );
        })() : (
          /* 尚未選擇對話 */
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 12, color: '#94a3b8',
          }}>
            <div style={{ fontSize: 56 }}>💬</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>選擇一個對話</p>
            <p style={{ fontSize: 13 }}>或從商品頁點「聯絡賣家」開始新對話</p>
          </div>
        )}
      </div>
    </div>
  );
}
