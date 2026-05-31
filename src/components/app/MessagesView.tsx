import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Send, Paperclip, MessageCircle, Plus, User, Trash2, ChevronLeft, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { uploadToImgBB } from '@/lib/order-utils';
import { SCRIPT_URL, Order } from '@/types';
import { fetchWithRetry } from '@/lib/fetchWithRetry';
import UserProfileModal from './UserProfileModal';
import { ensureBrowserNotificationPermission, showBrowserNotification } from '@/lib/browserNotifications';

interface Message {
  id: string;
  text: string;
  imageUrl?: string;
  mediaType?: 'image' | 'audio' | 'video' | 'file';
  mimeType?: string;
  fileName?: string;
  senderId: string;
  senderRole: string;
  createdAt: any;
  topicId: string;
}

interface Topic {
  id: string;
  name: string;
  createdAt: any;
  lastMessageAt?: any;
}

interface AuthUser {
  username: string;
  role: string;
}

export default function MessagesView({ role, allOrders = [], profileMode = 'kurdistani' }: { role: string, allOrders?: Order[], profileMode?: 'all' | 'kurdistani' | 'iraqi' }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<Topic[]>([{ id: 'general', name: 'General', createdAt: null }]);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [topic, setTopic] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastRead, setLastRead] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('messages_last_read') || '{}'); } catch { return {}; }
  });
  const [unreadCounts, setUnreadCounts] = useState<Record<string, boolean>>({});
  const [profileTarget, setProfileTarget] = useState<{username: string, role: string} | null>(null);

  // Audio Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<any>(null);

  const currentUser = localStorage.getItem('auth_username') || role;

  const getMediaType = (mimeType = '', fileName = ''): Message['mediaType'] => {
    const lowerName = fileName.toLowerCase();
    if (mimeType.startsWith('image/') || /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(lowerName)) return 'image';
    if (mimeType.startsWith('audio/') || /\.(webm|mp3|wav|ogg|m4a|aac)$/i.test(lowerName)) return 'audio';
    if (mimeType.startsWith('video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(lowerName)) return 'video';
    return 'file';
  };

  const getSupportedAudioMimeType = () => {
    const options = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];
    return options.find(type => MediaRecorder.isTypeSupported(type)) || '';
  };

  const getExtensionFromMimeType = (mimeType: string) => {
    if (mimeType.includes('mp4')) return 'm4a';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('mpeg')) return 'mp3';
    if (mimeType.includes('wav')) return 'wav';
    return 'webm';
  };

  const sendAttachmentMessage = async (downloadURL: string, fileName: string, mimeType: string) => {
    await addDoc(collection(db, `topics/${topic}/messages`), {
      text: '',
      imageUrl: downloadURL,
      mediaType: getMediaType(mimeType, fileName),
      mimeType,
      fileName,
      senderId: currentUser,
      senderRole: role,
      createdAt: serverTimestamp(),
      topicId: topic
    });
    const topicDisplay = topic.startsWith('dm_') ? `DM with ${topic.replace('dm_', '').replace(currentUser.toLowerCase(), '').replace('_', '')}` : undefined;
    await updateTopicLastMessage(topic, topicDisplay);
  };

  useEffect(() => {
    localStorage.setItem('messages_last_read', JSON.stringify(lastRead));
  }, [lastRead]);

  useEffect(() => {
    if (window.location.hash && window.location.hash.startsWith('#messages:')) {
      const t = window.location.hash.replace('#messages:', '');
      setTopic(t);
      setMobileView('chat');
      window.location.hash = ''; // clear it
    }
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    const container = document.getElementById('chat-messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    // Robustly scroll to bottom on new message
    scrollToBottom();
  }, [messages, mobileView]);

  // Request browser notifications
  useEffect(() => {
    ensureBrowserNotificationPermission();
  }, []);

  // Fetch topics and their last messages
  useEffect(() => {
    const q = query(collection(db, 'topics'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTopics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
      if (!fetchedTopics.find(t => t.id === 'general')) {
        fetchedTopics.push({ id: 'general', name: 'General', createdAt: null });
      }
      fetchedTopics.sort((a, b) => {
        const timeA = a.lastMessageAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
        const timeB = b.lastMessageAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setTopics(fetchedTopics);
      
      // Look for unread
      fetchedTopics.forEach(t => {
        if (t.lastMessageAt?.toMillis && t.lastMessageAt.toMillis() > (lastRead[t.id] || 0)) {
          setUnreadCounts(prev => ({ ...prev, [t.id]: true }));
        }
      });
    });
    return () => unsubscribe();
  }, [lastRead]);

  // Effect for messages topic
  useEffect(() => {
    const q = query(collection(db, `topics/${topic}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const msg = change.doc.data() as Message;
          if (msg.senderId !== currentUser && msg.createdAt?.toMillis && Date.now() - msg.createdAt.toMillis() < 10000) {
            showBrowserNotification(`New message from ${msg.senderId}`, {
              body: msg.text || 'Sent an attachment',
              icon: msg.imageUrl || '/logo.jpg',
              tag: `message-${topic}-${change.doc.id}`,
            });
          }
        }
      });
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setTimeout(() => scrollToBottom(), 100);
      
      // Update last read for current topic
      if (msgs.length > 0) {
        setLastRead(prev => ({ ...prev, [topic]: Date.now() }));
        setUnreadCounts(prev => ({ ...prev, [topic]: false }));
      }
    });
    return () => unsubscribe();
  }, [topic, currentUser]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !['owner', 'admin'].includes(role)) return;
    
    const id = newTopicName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await setDoc(doc(db, 'topics', id), {
      name: newTopicName.trim(),
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp()
    });
    setNewTopicName('');
    setTopic(id);
    toast.success("Topic created!");
  };

  const updateTopicLastMessage = async (topicId: string, topicName?: string) => {
    try {
      await setDoc(doc(db, 'topics', topicId), {
        lastMessageAt: serverTimestamp(),
        ...(topicName ? { name: topicName } : {})
      }, { merge: true });
    } catch { /* ignore */ }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() && !uploading) return;
    
    await addDoc(collection(db, `topics/${topic}/messages`), {
      text: newMessage.trim(),
      senderId: currentUser,
      senderRole: role,
      createdAt: serverTimestamp(),
      topicId: topic
    });
    
    const topicDisplay = topic.startsWith('dm_') ? `DM with ${topic.replace('dm_', '').replace(currentUser.toLowerCase(), '').replace('_', '')}` : undefined;
    await updateTopicLastMessage(topic, topicDisplay);
    
    setNewMessage('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    let downloadURL = '';
    
    try {
      if (file.type.startsWith('image/')) {
        downloadURL = await uploadToImgBB(file);
      } else {
        const storageRef = ref(storage, `messages/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type || 'application/octet-stream'
        });
        
        downloadURL = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
            }, 
            (error) => { reject(error); }, 
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }

      await sendAttachmentMessage(downloadURL, file.name, file.type);
      setUploading(false);
      e.target.value = '';
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setUploading(false);
      e.target.value = '';
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        toast.error("Voice recording is not supported in this browser");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const recordedMimeType = mediaRecorderRef.current?.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: recordedMimeType });
        if (audioBlob.size === 0) {
          toast.error("No audio was recorded");
          return;
        }
        setUploading(true);
        try {
          const fileName = `voice_${Date.now()}.${getExtensionFromMimeType(recordedMimeType)}`;
          const storageRef = ref(storage, `messages/${fileName}`);
          const snapshot = await uploadBytes(storageRef, audioBlob, {
            contentType: recordedMimeType
          });
          const downloadURL = await getDownloadURL(snapshot.ref);
          
          await sendAttachmentMessage(downloadURL, fileName, recordedMimeType);
          setUploading(false);
        } catch (err) {
          console.error(err);
          toast.error("Audio upload failed");
          setUploading(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Mic access denied", err);
      toast.error(`Mic access denied: ${err?.message || 'Unknown error'}`);
      toast.info("Please open the app in a new tab (button top right) and ensure microphone permissions are granted.", { duration: 8000 });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getDMTopicId = (u1: string, u2: string) => {
    return `dm_${[u1, u2].sort().join('_')}`;
  };

  const handleDeleteTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isParticipant = topicId.startsWith('dm_') && topicId.includes(currentUser.toLowerCase());
    if (!['owner', 'admin'].includes(role) && !isParticipant) return;
    if (window.confirm('Are you sure you want to delete this chat and all its messages?')) {
      try {
        await deleteDoc(doc(db, 'topics', topicId));
        if (topic === topicId) setTopic('general');
        toast.success("Topic deleted");
      } catch (err) {
        toast.error("Failed to delete topic");
      }
    }
  };

  const handleDeleteMessage = async (msgId: string, senderId: string) => {
    if (senderId !== currentUser && !['owner', 'admin'].includes(role)) return;
    if (window.confirm('Delete this message?')) {
      try {
        await deleteDoc(doc(db, `topics/${topic}/messages`, msgId));
      } catch (err) {
        toast.error("Failed to delete message");
      }
    }
  };

  const getTopicDisplayName = () => {
    if (topic.startsWith('dm_')) {
      return `@ ${topic.replace('dm_', '').replace(currentUser, '').replace('_', '')}`;
    }
    return `# ${topics.find(t => t.id === topic)?.name || topic}`;
  };

  return (
    <div className="flex h-full max-w-6xl mx-auto bg-card md:rounded-xl md:border shadow-sm overflow-hidden text-sm md:text-base">
      {/* Sidebar */}
      <div className={`${mobileView === 'sidebar' ? 'flex' : 'hidden'} md:flex w-full md:w-64 border-r bg-muted/20 flex-col h-full overflow-hidden shrink-0`}>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" /> Topics
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Channels</h3>
            <div className="space-y-1">
              {topics.filter(t => !t.id.startsWith('dm_')).map((t, idx) => (
                <div
                  key={`topic-${t.id}-${idx}`}
                  className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${topic === t.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => { setTopic(t.id); setMobileView('chat'); }}
                >
                  <span className="truncate"># {t.name}</span>
                  <div className="flex items-center gap-2">
                    {unreadCounts[t.id] && topic !== t.id && (
                      <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                    )}
                    {['owner', 'admin'].includes(role) && t.id !== 'general' && (
                      <Trash2 
                        className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity" 
                        onClick={(e) => handleDeleteTopic(t.id, e)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Direct Messages</h3>
            <div className="space-y-1">
              {topics.filter(t => t.id.startsWith('dm_')).map((t, idx) => {
                const displayName = `@ ${t.id.replace('dm_', '').replace(currentUser.toLowerCase(), '').replace('_', '')}`;
                // Only show if the current user is part of this DM, OR owner based on requirements, but DM ID has both usernames
                if (!t.id.includes(currentUser.toLowerCase()) && role !== 'owner') return null;
                
                return (
                  <div
                    key={`topic-dm-${t.id}-${idx}`}
                    className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${topic === t.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => { setTopic(t.id); setMobileView('chat'); }}
                  >
                    <span className="truncate">{displayName}</span>
                    <div className="flex items-center gap-2">
                      {unreadCounts[t.id] && topic !== t.id && (
                        <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                      )}
                      {( ['owner', 'admin'].includes(role) || t.id.includes(currentUser.toLowerCase()) ) && (
                        <Trash2 
                          className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity" 
                          onClick={(e) => handleDeleteTopic(t.id, e)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {['owner', 'admin'].includes(role) && (
          <div className="p-4 border-t bg-muted/30">
            <form onSubmit={handleCreateTopic} className="flex gap-2">
              <Input 
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="New topic..."
                className="h-9"
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className={`${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0 relative`}>
        <div className="sticky top-0 p-4 border-b bg-background/95 backdrop-blur flex justify-between items-center shadow-sm z-50 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMobileView('sidebar')}
              className="md:hidden p-1 -ml-2 mr-1 text-muted-foreground hover:bg-muted rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-semibold text-lg truncate flex items-center gap-2">
              {topic.startsWith('dm_') ? <User className="h-5 w-5 shrink-0" /> : null}
              <span className="truncate">{getTopicDisplayName()}</span>
            </h2>
          </div>
        </div>
        
    <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages-container">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground italic flex-col gap-2">
              <MessageCircle className="h-10 w-10 opacity-20" />
              <p>No messages yet.</p>
              {topic.startsWith('dm_') && <p className="text-sm border bg-muted/50 px-3 py-1 rounded-full">Say hi to start the conversation!</p>}
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === currentUser;
              const canDelete = isMe || ['owner', 'admin'].includes(role);
              return (
                <div key={`msg-${msg.id}-${idx}`} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group w-full`}>
                  <div 
                    className="text-xs text-muted-foreground mb-1 cursor-pointer hover:underline flex items-center gap-1"
                    onClick={() => setProfileTarget({ username: msg.senderId, role: msg.senderRole })}
                  >
                    {!isMe && <User className="h-3 w-3" />}
                    {msg.senderId} <span className="opacity-70">({msg.senderRole})</span>
                    {isMe && <User className="h-3 w-3" />}
                  </div>
                  <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} max-w-[85%]`}>
                    <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                      {msg.text && <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>}
                      {msg.imageUrl && (
                        (msg.mediaType || getMediaType(msg.mimeType, msg.fileName || msg.imageUrl)) === 'audio' ? (
                          <audio src={msg.imageUrl} controls className="mt-2 max-w-[200px]" />
                        ) : (msg.mediaType || getMediaType(msg.mimeType, msg.fileName || msg.imageUrl)) === 'video' ? (
                          <video src={msg.imageUrl} controls className="rounded-lg mt-2 max-w-full max-h-64" />
                        ) : (msg.mediaType || getMediaType(msg.mimeType, msg.fileName || msg.imageUrl)) === 'image' || msg.imageUrl.includes('alt=media') ? (
                          <img src={msg.imageUrl} alt="attachment" referrerPolicy="no-referrer" className="rounded-lg mt-2 max-w-full max-h-64 object-contain" />
                        ) : (
                          <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className={`underline text-sm mt-2 block break-all flex items-center gap-1 ${isMe ? 'text-primary-foreground/80' : 'text-primary/80'}`}>
                            <Paperclip className="h-3 w-3" /> View Attachment
                          </a>
                        )
                      )}
                    </div>
                    {canDelete && (
                      <button 
                        onClick={() => handleDeleteMessage(msg.id, msg.senderId)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all shrink-0"
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-background border-t">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <label className="cursor-pointer p-2 hover:bg-muted rounded-full transition-colors relative">
              <input type="file" className="hidden" accept="*/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading ? (
                 <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                 <Paperclip className="h-5 w-5 text-muted-foreground" />
              )}
            </label>

            {isRecording ? (
              <div className="flex-1 flex items-center gap-3 bg-red-50 text-red-500 rounded-full px-4 h-10 border border-red-200">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-medium font-mono text-sm">{formatDuration(recordingDuration)}</span>
                <span className="text-sm opacity-80 flex-1">Recording...</span>
              </div>
            ) : (
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${getTopicDisplayName()}...`}
                className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:bg-background"
                disabled={uploading}
              />
            )}

            {newMessage.trim() === '' && !uploading ? (
              <Button 
                type="button" 
                size="icon" 
                variant={isRecording ? 'destructive' : 'secondary'}
                className="rounded-full shrink-0 transition-colors" 
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            ) : (
              <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!newMessage.trim() && !uploading}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
      
      {profileTarget && (
        <UserProfileModal 
          userTarget={profileTarget} 
          allOrders={allOrders}
          profileMode={profileMode}
          onClose={() => setProfileTarget(null)} 
          onMessage={() => {
            setTopic(getDMTopicId(currentUser, profileTarget.username));
            setProfileTarget(null);
            setMobileView('chat');
          }}
        />
      )}
    </div>
  );
}
