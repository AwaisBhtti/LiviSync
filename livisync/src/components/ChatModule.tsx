import { useState, useEffect, useRef } from 'react';
import type { MatchRequest, User, Message } from '../types';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { supabase } from '../supabase';
import { API_BASE_URL } from '../config';

interface ChatModuleProps {
  currentUser: User;
  users: User[];
  matchRequests: MatchRequest[];
  onBlockUser: (targetId: string) => void;
  onMessagesRead: () => void;
  onUnfriend: (matchRequestId: string) => Promise<void>;
  onReportUser: (reportedId: string, reason: string, description: string) => Promise<void>;
}

export const ChatModule = ({
  currentUser,
  users,
  matchRequests,
  onBlockUser,
  onMessagesRead,
  onUnfriend,
  onReportUser,
}: ChatModuleProps) => {
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typedMessage, setTypedMessage] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showRespondentProfile, setShowRespondentProfile] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('other');
  const [reportDescription, setReportDescription] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Filter out users who are active matches (accepted status), sorted by latest message
  const activeMatches = matchRequests
    .filter((r) => r.status === 'accepted' && (r.senderId === currentUser.id || r.receiverId === currentUser.id))
    .map((r) => {
      const matchId = r.senderId === currentUser.id ? r.receiverId : r.senderId;
      return users.find((u) => u.id === matchId);
    })
    .filter((u): u is User => !!u && !currentUser.blockedUsers.includes(u.id))
    .sort((a, b) => {
      const msgsA = messages[a.id] || [];
      const msgsB = messages[b.id] || [];
      const lastMsgA = msgsA[msgsA.length - 1];
      const lastMsgB = msgsB[msgsB.length - 1];
      const timeA = lastMsgA ? new Date(lastMsgA.timestamp).getTime() : 0;
      const timeB = lastMsgB ? new Date(lastMsgB.timestamp).getTime() : 0;
      return timeB - timeA;
    });

  // Set Auth token for Supabase Realtime connection
  useEffect(() => {
    if (currentUser && 'supabaseToken' in currentUser && currentUser.supabaseToken) {
      supabase.realtime.setAuth(currentUser.supabaseToken);
    }
  }, [currentUser]);

  // Load chat history from backend REST API
  useEffect(() => {
    if (!activeChatUserId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chat/history/${activeChatUserId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('livisync_token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => ({
            ...prev,
            [activeChatUserId]: data
          }));
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };

    fetchHistory();
  }, [activeChatUserId]);

  const activeMatchesIds = activeMatches.map(m => m.id).join(',');
  // Load initial chat history for all active matches so last message preview works
  useEffect(() => {
    if (activeMatches.length === 0) {
      setLoadingHistory(false);
      return;
    }

    let loadedCount = 0;
    activeMatches.forEach(matchUser => {
      if (messages[matchUser.id]) {
        loadedCount++;
        if (loadedCount === activeMatches.length) {
          setLoadingHistory(false);
        }
        return; // already loaded
      }

      const fetchMatchHistory = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/chat/history/${matchUser.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('livisync_token')}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setMessages((prev) => ({
              ...prev,
              [matchUser.id]: data
            }));
          }
        } catch (err) {
          console.error("Error pre-fetching chat history:", err);
        } finally {
          loadedCount++;
          if (loadedCount === activeMatches.length) {
            setLoadingHistory(false);
          }
        }
      };
      fetchMatchHistory();
    });
  }, [activeMatchesIds]);

  // Subscribe to realtime message insert broadcasts globally for all our chats
  useEffect(() => {
    const channel = supabase
      .channel('chat-global-module')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as any;
          if (newMsg && (newMsg.sender_id === currentUser.id || newMsg.receiver_id === currentUser.id)) {
            const peerId = newMsg.sender_id === currentUser.id ? newMsg.receiver_id : newMsg.sender_id;
            const mappedMsg: Message = {
              id: newMsg.id,
              senderId: newMsg.sender_id,
              text: newMsg.text,
              timestamp: newMsg.created_at,
              read: newMsg.is_read
            };
            setMessages((prev) => {
              const currentChatMsgs = prev[peerId] || [];
              if (currentChatMsgs.some(m => m.id === mappedMsg.id)) {
                return prev;
              }
              return {
                ...prev,
                [peerId]: [...currentChatMsgs, mappedMsg]
              };
            });

            // If we are currently inside the active chat with the sender, mark as read immediately!
            if (activeChatUserId === peerId && newMsg.receiver_id === currentUser.id) {
              fetch(`${API_BASE_URL}/chat/read/${activeChatUserId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('livisync_token')}`
                }
              }).then(() => {
                onMessagesRead();
                setMessages((prev) => {
                  const peerChatMsgs = prev[activeChatUserId] || [];
                  const updated = peerChatMsgs.map(m => m.senderId === activeChatUserId ? { ...m, read: true } : m);
                  return {
                    ...prev,
                    [activeChatUserId]: updated
                  };
                });
              }).catch(err => console.error(err));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, activeChatUserId, onMessagesRead]);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (!activeChatUserId) return;

    const markRead = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chat/read/${activeChatUserId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('livisync_token')}`
          }
        });
        if (res.ok) {
          onMessagesRead();
          setMessages((prev) => {
            const peerChatMsgs = prev[activeChatUserId] || [];
            const updated = peerChatMsgs.map(m => m.senderId === activeChatUserId ? { ...m, read: true } : m);
            return {
              ...prev,
              [activeChatUserId]: updated
            };
          });
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };

    markRead();
  }, [activeChatUserId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatUserId) return;

    const textToSend = typedMessage;
    setTypedMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('livisync_token')}`
        },
        body: JSON.stringify({
          receiver_id: activeChatUserId,
          text: textToSend
        })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to send message');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending message');
    }
  };

  const getRespondent = () => {
    return users.find((u) => u.id === activeChatUserId);
  };

  return (
    <div style={containerStyle}>
      {/* Wrap everything in a single unified dashboard card */}
      <div className="card" style={{ ...chatGridStyle, height: '100%' }}>
        {/* Left Side: Inbox Lists (Active Chats Only) */}
        <div style={inboxListStyle(!!activeChatUserId)}>
          {/* Section: Active Chats */}
          <div style={sectionStyle}>
            <h3 style={sectionHeaderStyle}>Roommate Chats ({activeMatches.length})</h3>
            {activeMatches.length === 0 ? (
              <p style={emptyTextStyle}>No confirmed roommate matches yet. Connect with roommates from the roommate directory!</p>
            ) : (
              <div style={listStyle}>
                {activeMatches.map((matchUser) => {
                  const hasUnread = messages[matchUser.id]?.some(m => !m.read && m.senderId === matchUser.id);
                  return (
                    <div
                      key={matchUser.id}
                      onClick={() => setActiveChatUserId(matchUser.id)}
                      style={{
                        ...chatRowStyle(activeChatUserId === matchUser.id),
                        position: 'relative'
                      }}
                    >
                      <img src={matchUser.photo} alt={matchUser.name} style={avatarStyle} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: hasUnread ? 700 : 500 }}>{matchUser.name}</h4>
                          {hasUnread && (
                            <span style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: 'var(--primary)',
                              borderRadius: '50%',
                              display: 'inline-block'
                            }} />
                          )}
                        </div>
                        <p style={{
                          ...chatPreviewTextStyle,
                          fontWeight: hasUnread ? 600 : 400,
                          color: hasUnread ? 'var(--foreground)' : 'var(--muted)'
                        }}>
                          {loadingHistory
                            ? 'Loading messages...'
                            : (messages[matchUser.id]?.[messages[matchUser.id].length - 1]?.text || 'No messages yet. Say hi!')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div style={chatWindowStyle(!!activeChatUserId)}>
          {activeChatUserId ? (
            <>
              {/* Chat Header */}
              <div style={chatHeaderStyle}>
                <button
                  style={backButtonStyle}
                  onClick={() => setActiveChatUserId(null)}
                >
                  <ArrowLeft size={18} />
                </button>
                <div
                  onClick={() => setShowRespondentProfile(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, minWidth: 0 }}
                >
                  <img
                    src={getRespondent()?.photo}
                    alt={getRespondent()?.name}
                    style={avatarStyle}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{getRespondent()?.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Click to view profile.</p>
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    if (confirm(`Block ${getRespondent()?.name}?`)) {
                      onBlockUser(activeChatUserId);
                      setActiveChatUserId(null);
                    }
                  }}
                >
                  Block
                </button>
              </div>

              {/* Chat Messages */}
              <div style={chatMessagesStyle}>
                {(messages[activeChatUserId] || []).length === 0 ? (
                  <div style={chatEmptyFeedStyle}>
                    <MessageSquare size={24} style={{ color: 'var(--border)' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                      This is the beginning of your chat history. Say hello!
                    </p>
                  </div>
                ) : (
                  (messages[activeChatUserId] || []).map((msg) => {
                    const isSelf = msg.senderId === currentUser.id;
                    return (
                      <div key={msg.id} style={msgRowStyle(isSelf)}>
                        <div style={msgBubbleStyle(isSelf)}>
                          <p style={{ fontSize: '0.875rem' }}>{msg.text}</p>
                          <span style={msgTimeStyle(isSelf)}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} style={chatInputAreaStyle}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  style={chatInputFieldStyle}
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem' }}>
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={noChatSelectedStyle}>
              <MessageSquare size={36} style={{ color: 'var(--border)' }} />
              <h3 style={{ fontSize: '1rem', marginTop: '0.75rem' }}>Your Messages</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Select a matched roommate from the sidebar to view chat logs and coordinate.
              </p>
            </div>
          )}
        </div>
      </div>

      {showRespondentProfile && getRespondent() && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: 'var(--foreground)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                {showReportForm ? `Report ${getRespondent()?.name}` : 'Roommate Profile'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowRespondentProfile(false);
                  setShowReportForm(false);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            {showReportForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}
                  >
                    <option value="fake-profile">Fake Profile</option>
                    <option value="harassment">Harassment</option>
                    <option value="spam">Spam</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Description</label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe the situation in detail..."
                    rows={4}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)', resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={async () => {
                      const respondent = getRespondent();
                      if (!respondent) return;
                      try {
                        await onReportUser(respondent.id, reportReason, reportDescription);
                        setShowReportForm(false);
                        const stillConnected = matchRequests.some(
                          (r) => r.status === 'accepted' &&
                            ((r.senderId === currentUser.id && r.receiverId === respondent.id) ||
                              (r.senderId === respondent.id && r.receiverId === currentUser.id))
                        );
                        if (!stillConnected) {
                          setShowRespondentProfile(false);
                          setActiveChatUserId(null);
                        }
                      } catch (err: any) {
                        alert(err.message || 'Error submitting report');
                      }
                    }}
                  >
                    Submit Safety Report
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 0.5 }}
                    onClick={() => setShowReportForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={getRespondent()?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80'}
                    alt=""
                    style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{getRespondent()?.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {getRespondent()?.age} y/o • {getRespondent()?.gender}
                    </span>
                  </div>
                </div>

                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>Contact Info</h5>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>📧 Email: {getRespondent()?.email}</p>
                  {getRespondent()?.phone && <p style={{ margin: 0, fontSize: '0.875rem' }}>📞 Phone: {getRespondent()?.phone}</p>}
                </div>

                {getRespondent()?.bio && (
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>Biography</h5>
                    <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--muted)' }}>{getRespondent()?.bio}</p>
                  </div>
                )}

                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--muted)' }}>Details</h5>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>📍 Preferred Location: {getRespondent()?.location}</p>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>💰 Max Budget: PKR {getRespondent()?.budget?.toLocaleString()} / mo</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                    💼 Occupation: {getRespondent()?.occupation || 'student'}
                    {getRespondent()?.institution && ` at ${getRespondent()?.institution}`}
                    {getRespondent()?.company && ` at ${getRespondent()?.company}`}
                  </p>
                </div>

                {getRespondent()?.preferences && (
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--muted)' }}>Lifestyle Habits</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        🛌 Sleep: {getRespondent()?.preferences.sleepSchedule || 'flexible'}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        🧹 Cleanliness: {getRespondent()?.preferences.cleanliness || 'moderate'}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        🚬 Smoking: {getRespondent()?.preferences.smoking || 'no'}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        🐾 Pets: {getRespondent()?.preferences.pets || 'no'}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                        👥 Guests: {getRespondent()?.preferences.guestTolerance || 'weekends'}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ flex: '1 1 100%' }}
                    onClick={async () => {
                      const respondent = getRespondent();
                      if (!respondent) return;

                      const connection = matchRequests.find(
                        (r) => r.status === 'accepted' &&
                          ((r.senderId === currentUser.id && r.receiverId === respondent.id) ||
                            (r.senderId === respondent.id && r.receiverId === currentUser.id))
                      );

                      if (connection) {
                        if (confirm(`Are you sure you want to unfriend ${respondent.name}? You will no longer be connected.`)) {
                          try {
                            await onUnfriend(connection.id);
                            setShowRespondentProfile(false);
                            setActiveChatUserId(null);
                          } catch (err: any) {
                            alert(err.message || 'Error unfriending.');
                          }
                        }
                      } else {
                        alert('Could not find active match request to delete.');
                      }
                    }}
                  >
                    Unfriend Roommate
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: '1', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                    onClick={async () => {
                      const respondent = getRespondent();
                      if (!respondent) return;
                      if (confirm(`Are you sure you want to block ${respondent.name}? You will no longer be connected.`)) {
                        try {
                          await onBlockUser(respondent.id);
                          setShowRespondentProfile(false);
                          setActiveChatUserId(null);
                        } catch (err: any) {
                          alert(err.message || 'Error blocking user.');
                        }
                      }
                    }}
                  >
                    Block
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: '1', border: '1px solid #eab308', color: '#eab308' }}
                    onClick={() => setShowReportForm(true)}
                  >
                    Report
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: '0.5' }}
                    onClick={() => {
                      setShowRespondentProfile(false);
                      setShowReportForm(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 120px)',
};

const chatGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '320px 1fr',
  gap: 0,
  height: '100%',
};

const inboxListStyle = (isChatActive: boolean): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    height: '100%',
    borderRight: '1px solid var(--border)',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  };
  // Responsive check
  if (isChatActive && window.innerWidth <= 768) {
    return { ...base, display: 'none' };
  }
  return base;
};

const chatWindowStyle = (isChatActive: boolean): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  };
  // Responsive check
  if (!isChatActive && window.innerWidth <= 768) {
    return { ...base, display: 'none' };
  }
  return base;
};

const sectionStyle: React.CSSProperties = {
  padding: '1.25rem',
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--muted)',
  marginBottom: '0.75rem',
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--muted)',
  fontStyle: 'italic',
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};



const avatarStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid white',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
};

const chatRowStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.875rem',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  transition: 'var(--transition)',
  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.45)',
  border: isActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--border)',
  boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.05)' : 'none',
  marginBottom: '0.25rem',
});

const chatPreviewTextStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--muted)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: '0.125rem',
};

const chatHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.875rem 1.25rem',
  borderBottom: '1px solid var(--border)',
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(8px)',
};

const backButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--muted)',
  display: window.innerWidth <= 768 ? 'block' : 'none',
};

const chatMessagesStyle: React.CSSProperties = {
  flex: 1,
  padding: '1.5rem',
  overflowY: 'auto',
  backgroundColor: 'rgba(248, 250, 252, 0.35)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const chatEmptyFeedStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
};

const msgRowStyle = (isSelf: boolean): React.CSSProperties => ({
  display: 'flex',
  justifyContent: isSelf ? 'flex-end' : 'flex-start',
});

const msgBubbleStyle = (isSelf: boolean): React.CSSProperties => ({
  maxWidth: '70%',
  padding: '0.75rem 1rem',
  borderRadius: isSelf ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
  background: isSelf ? 'var(--gradient-brand)' : '#ffffff',
  color: isSelf ? 'var(--primary-foreground)' : 'var(--foreground)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
  border: isSelf ? 'none' : '1px solid var(--border)',
});

const msgTimeStyle = (isSelf: boolean): React.CSSProperties => ({
  display: 'block',
  fontSize: '0.65rem',
  textAlign: 'right',
  marginTop: '0.25rem',
  color: isSelf ? 'rgba(255, 255, 255, 0.75)' : 'var(--muted)',
});

const chatInputAreaStyle: React.CSSProperties = {
  padding: '0.875rem 1.25rem',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
};

const chatInputFieldStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.625rem 0.875rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  outline: 'none',
};

const noChatSelectedStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  padding: '2rem',
};
