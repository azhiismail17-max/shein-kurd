import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aL as query, U as collection, aD as onSnapshot, aH as orderBy, a1 as deleteDoc, a5 as doc, aR as setDoc, aQ as serverTimestamp, z as addDoc } from "../_libs/firebase__firestore.mjs";
import { f as ensureBrowserNotificationPermission, e as db, v as showBrowserNotification, w as storage } from "./use-toast-CUyDYyz5.mjs";
import { r as ref, b as uploadBytesResumable, g as getDownloadURL, u as uploadBytes } from "../_libs/firebase__storage.mjs";
import { B as Button } from "./combinedProfile-1uPdsXSI.mjs";
import { I as Input } from "./input-cN8SQZYK.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { uploadToImgBB } from "./order-utils-BT6DDCZZ.mjs";
import { U as UserProfileModal } from "./UserProfileModal-CJLhJh7U.mjs";
import "../_libs/firebase.mjs";
import { w as MessageCircle, a1 as Trash2, Q as Plus, i as ChevronLeft, a6 as User, K as Paperclip, $ as Square, x as Mic, U as Send } from "../_libs/lucide-react.mjs";
import "../_libs/firebase__app.mjs";
import "../_libs/firebase__component.mjs";
import "../_libs/firebase__util.mjs";
import "../_libs/firebase__logger.mjs";
import "../_libs/idb.mjs";
import "../_libs/firebase__webchannel-wrapper.mjs";
import "util";
import "crypto";
import "../_libs/@grpc/grpc-js.mjs";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "http2";
import "dns";
import "stream";
import "../_libs/@grpc/proto-loader.mjs";
import "path";
import "../_libs/lodash.camelcase.mjs";
import "../_libs/protobufjs.mjs";
import "../_libs/protobufjs__aspromise.mjs";
import "../_libs/protobufjs__base64.mjs";
import "../_libs/protobufjs__eventemitter.mjs";
import "../_libs/protobufjs__float.mjs";
import "../_libs/@protobufjs/inquire.mjs";
import "../_libs/protobufjs__utf8.mjs";
import "../_libs/protobufjs__pool.mjs";
import "../_libs/long.mjs";
import "../_libs/protobufjs__codegen.mjs";
import "../_libs/protobufjs__fetch.mjs";
import "../_libs/protobufjs__path.mjs";
import "http";
import "url";
import "zlib";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "async_hooks";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "./index-CHMLBzfP.mjs";
function MessagesView({ role, allOrders = [], profileMode = "kurdistani" }) {
  const [messages, setMessages] = reactExports.useState([]);
  const [topics, setTopics] = reactExports.useState([{ id: "general", name: "General", createdAt: null }]);
  const [users, setUsers] = reactExports.useState([]);
  const [newMessage, setNewMessage] = reactExports.useState("");
  const [topic, setTopic] = reactExports.useState("general");
  const [uploading, setUploading] = reactExports.useState(false);
  const [newTopicName, setNewTopicName] = reactExports.useState("");
  const [mobileView, setMobileView] = reactExports.useState("sidebar");
  const messagesEndRef = reactExports.useRef(null);
  const [lastRead, setLastRead] = reactExports.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("messages_last_read") || "{}");
    } catch {
      return {};
    }
  });
  const [unreadCounts, setUnreadCounts] = reactExports.useState({});
  const [profileTarget, setProfileTarget] = reactExports.useState(null);
  const [isRecording, setIsRecording] = reactExports.useState(false);
  const [recordingDuration, setRecordingDuration] = reactExports.useState(0);
  const mediaRecorderRef = reactExports.useRef(null);
  const audioChunksRef = reactExports.useRef([]);
  const timerRef = reactExports.useRef(null);
  const currentUser = localStorage.getItem("auth_username") || role;
  const getMediaType = (mimeType = "", fileName = "") => {
    const lowerName = fileName.toLowerCase();
    if (mimeType.startsWith("image/") || /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(lowerName)) return "image";
    if (mimeType.startsWith("audio/") || /\.(webm|mp3|wav|ogg|m4a|aac)$/i.test(lowerName)) return "audio";
    if (mimeType.startsWith("video/") || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(lowerName)) return "video";
    return "file";
  };
  const getSupportedAudioMimeType = () => {
    const options = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus"
    ];
    return options.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  };
  const getExtensionFromMimeType = (mimeType) => {
    if (mimeType.includes("mp4")) return "m4a";
    if (mimeType.includes("ogg")) return "ogg";
    if (mimeType.includes("mpeg")) return "mp3";
    if (mimeType.includes("wav")) return "wav";
    return "webm";
  };
  const sendAttachmentMessage = async (downloadURL, fileName, mimeType) => {
    await addDoc(collection(db, `topics/${topic}/messages`), {
      text: "",
      imageUrl: downloadURL,
      mediaType: getMediaType(mimeType, fileName),
      mimeType,
      fileName,
      senderId: currentUser,
      senderRole: role,
      createdAt: serverTimestamp(),
      topicId: topic
    });
    const topicDisplay = topic.startsWith("dm_") ? `DM with ${topic.replace("dm_", "").replace(currentUser.toLowerCase(), "").replace("_", "")}` : void 0;
    await updateTopicLastMessage(topic, topicDisplay);
  };
  reactExports.useEffect(() => {
    localStorage.setItem("messages_last_read", JSON.stringify(lastRead));
  }, [lastRead]);
  reactExports.useEffect(() => {
    if (window.location.hash && window.location.hash.startsWith("#messages:")) {
      const t = window.location.hash.replace("#messages:", "");
      setTopic(t);
      setMobileView("chat");
      window.location.hash = "";
    }
  }, []);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    const container = document.getElementById("chat-messages-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };
  reactExports.useEffect(() => {
    scrollToBottom();
  }, [messages, mobileView]);
  reactExports.useEffect(() => {
    ensureBrowserNotificationPermission();
  }, []);
  reactExports.useEffect(() => {
    const q = query(collection(db, "topics"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTopics = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      if (!fetchedTopics.find((t) => t.id === "general")) {
        fetchedTopics.push({ id: "general", name: "General", createdAt: null });
      }
      fetchedTopics.sort((a, b) => {
        const timeA = a.lastMessageAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
        const timeB = b.lastMessageAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setTopics(fetchedTopics);
      fetchedTopics.forEach((t) => {
        if (t.lastMessageAt?.toMillis && t.lastMessageAt.toMillis() > (lastRead[t.id] || 0)) {
          setUnreadCounts((prev) => ({ ...prev, [t.id]: true }));
        }
      });
    });
    return () => unsubscribe();
  }, [lastRead]);
  reactExports.useEffect(() => {
    const q = query(collection(db, `topics/${topic}/messages`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const msg = change.doc.data();
          if (msg.senderId !== currentUser && msg.createdAt?.toMillis && Date.now() - msg.createdAt.toMillis() < 1e4) {
            showBrowserNotification(`New message from ${msg.senderId}`, {
              body: msg.text || "Sent an attachment",
              icon: msg.imageUrl || "/logo.jpg",
              tag: `message-${topic}-${change.doc.id}`
            });
          }
        }
      });
      const msgs = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
      setMessages(msgs);
      setTimeout(() => scrollToBottom(), 100);
      if (msgs.length > 0) {
        setLastRead((prev) => ({ ...prev, [topic]: Date.now() }));
        setUnreadCounts((prev) => ({ ...prev, [topic]: false }));
      }
    });
    return () => unsubscribe();
  }, [topic, currentUser]);
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !["owner", "admin"].includes(role)) return;
    const id = newTopicName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    await setDoc(doc(db, "topics", id), {
      name: newTopicName.trim(),
      createdAt: serverTimestamp(),
      lastMessageAt: serverTimestamp()
    });
    setNewTopicName("");
    setTopic(id);
    toast.success("Topic created!");
  };
  const updateTopicLastMessage = async (topicId, topicName) => {
    try {
      await setDoc(doc(db, "topics", topicId), {
        lastMessageAt: serverTimestamp(),
        ...topicName ? { name: topicName } : {}
      }, { merge: true });
    } catch {
    }
  };
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !uploading) return;
    await addDoc(collection(db, `topics/${topic}/messages`), {
      text: newMessage.trim(),
      senderId: currentUser,
      senderRole: role,
      createdAt: serverTimestamp(),
      topicId: topic
    });
    const topicDisplay = topic.startsWith("dm_") ? `DM with ${topic.replace("dm_", "").replace(currentUser.toLowerCase(), "").replace("_", "")}` : void 0;
    await updateTopicLastMessage(topic, topicDisplay);
    setNewMessage("");
  };
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    let downloadURL = "";
    try {
      if (file.type.startsWith("image/")) {
        downloadURL = await uploadToImgBB(file);
      } else {
        const storageRef = ref(storage, `messages/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type || "application/octet-stream"
        });
        downloadURL = await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
            },
            (error) => {
              reject(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }
      await sendAttachmentMessage(downloadURL, file.name, file.type);
      setUploading(false);
      e.target.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
      setUploading(false);
      e.target.value = "";
    }
  };
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        toast.error("Voice recording is not supported in this browser");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioMimeType();
      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : void 0);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const recordedMimeType = mediaRecorderRef.current?.mimeType || mimeType || "audio/webm";
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
        setRecordingDuration((prev) => prev + 1);
      }, 1e3);
    } catch (err) {
      console.error("Mic access denied", err);
      toast.error(`Mic access denied: ${err?.message || "Unknown error"}`);
      toast.info("Please open the app in a new tab (button top right) and ensure microphone permissions are granted.", { duration: 8e3 });
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };
  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  const getDMTopicId = (u1, u2) => {
    return `dm_${[u1, u2].sort().join("_")}`;
  };
  const handleDeleteTopic = async (topicId, e) => {
    e.stopPropagation();
    const isParticipant = topicId.startsWith("dm_") && topicId.includes(currentUser.toLowerCase());
    if (!["owner", "admin"].includes(role) && !isParticipant) return;
    if (window.confirm("Are you sure you want to delete this chat and all its messages?")) {
      try {
        await deleteDoc(doc(db, "topics", topicId));
        if (topic === topicId) setTopic("general");
        toast.success("Topic deleted");
      } catch (err) {
        toast.error("Failed to delete topic");
      }
    }
  };
  const handleDeleteMessage = async (msgId, senderId) => {
    if (senderId !== currentUser && !["owner", "admin"].includes(role)) return;
    if (window.confirm("Delete this message?")) {
      try {
        await deleteDoc(doc(db, `topics/${topic}/messages`, msgId));
      } catch (err) {
        toast.error("Failed to delete message");
      }
    }
  };
  const getTopicDisplayName = () => {
    if (topic.startsWith("dm_")) {
      return `@ ${topic.replace("dm_", "").replace(currentUser, "").replace("_", "")}`;
    }
    return `# ${topics.find((t) => t.id === topic)?.name || topic}`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full max-w-6xl mx-auto bg-card md:rounded-xl md:border shadow-sm overflow-hidden text-sm md:text-base", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${mobileView === "sidebar" ? "flex" : "hidden"} md:flex w-full md:w-64 border-r bg-muted/20 flex-col h-full overflow-hidden shrink-0`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" }),
        " Topics"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-2 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2", children: "Channels" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: topics.filter((t) => !t.id.startsWith("dm_")).map((t, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${topic === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`,
              onClick: () => {
                setTopic(t.id);
                setMobileView("chat");
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                  "# ",
                  t.name
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  unreadCounts[t.id] && topic !== t.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-red-500 shrink-0" }),
                  ["owner", "admin"].includes(role) && t.id !== "general" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Trash2,
                    {
                      className: "h-3.5 w-3.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity",
                      onClick: (e) => handleDeleteTopic(t.id, e)
                    }
                  )
                ] })
              ]
            },
            `topic-${t.id}-${idx}`
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2", children: "Direct Messages" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: topics.filter((t) => t.id.startsWith("dm_")).map((t, idx) => {
            const displayName = `@ ${t.id.replace("dm_", "").replace(currentUser.toLowerCase(), "").replace("_", "")}`;
            if (!t.id.includes(currentUser.toLowerCase()) && role !== "owner") return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${topic === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`,
                onClick: () => {
                  setTopic(t.id);
                  setMobileView("chat");
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: displayName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    unreadCounts[t.id] && topic !== t.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-red-500 shrink-0" }),
                    (["owner", "admin"].includes(role) || t.id.includes(currentUser.toLowerCase())) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Trash2,
                      {
                        className: "h-3.5 w-3.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity",
                        onClick: (e) => handleDeleteTopic(t.id, e)
                      }
                    )
                  ] })
                ]
              },
              `topic-dm-${t.id}-${idx}`
            );
          }) })
        ] })
      ] }),
      ["owner", "admin"].includes(role) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateTopic, className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: newTopicName,
            onChange: (e) => setNewTopicName(e.target.value),
            placeholder: "New topic...",
            className: "h-9"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "icon", className: "h-9 w-9 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0 relative`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky top-0 p-4 border-b bg-background/95 backdrop-blur flex justify-between items-center shadow-sm z-50 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setMobileView("sidebar"),
            className: "md:hidden p-1 -ml-2 mr-1 text-muted-foreground hover:bg-muted rounded",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-lg truncate flex items-center gap-2", children: [
          topic.startsWith("dm_") ? /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5 shrink-0" }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: getTopicDisplayName() })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", id: "chat-messages-container", children: [
        messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex items-center justify-center text-muted-foreground italic flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-10 w-10 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No messages yet." }),
          topic.startsWith("dm_") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm border bg-muted/50 px-3 py-1 rounded-full", children: "Say hi to start the conversation!" })
        ] }) : messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser;
          const canDelete = isMe || ["owner", "admin"].includes(role);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col ${isMe ? "items-end" : "items-start"} group w-full`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "text-xs text-muted-foreground mb-1 cursor-pointer hover:underline flex items-center gap-1",
                onClick: () => setProfileTarget({ username: msg.senderId, role: msg.senderRole }),
                children: [
                  !isMe && /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
                  msg.senderId,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70", children: [
                    "(",
                    msg.senderRole,
                    ")"
                  ] }),
                  isMe && /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} max-w-[85%]`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl px-4 py-2.5 shadow-sm text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`, children: [
                msg.text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap break-words leading-relaxed", children: msg.text }),
                msg.imageUrl && ((msg.mediaType || getMediaType(msg.mimeType, msg.fileName || msg.imageUrl)) === "audio" ? /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { src: msg.imageUrl, controls: true, className: "mt-2 max-w-[200px]" }) : (msg.mediaType || getMediaType(msg.mimeType, msg.fileName || msg.imageUrl)) === "video" ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: msg.imageUrl, controls: true, className: "rounded-lg mt-2 max-w-full max-h-64" }) : (msg.mediaType || getMediaType(msg.mimeType, msg.fileName || msg.imageUrl)) === "image" || msg.imageUrl.includes("alt=media") ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: msg.imageUrl, alt: "attachment", referrerPolicy: "no-referrer", className: "rounded-lg mt-2 max-w-full max-h-64 object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: msg.imageUrl, target: "_blank", rel: "noopener noreferrer", className: `underline text-sm mt-2 block break-all flex items-center gap-1 ${isMe ? "text-primary-foreground/80" : "text-primary/80"}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3 w-3" }),
                  " View Attachment"
                ] }))
              ] }),
              canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => handleDeleteMessage(msg.id, msg.senderId),
                  className: "opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all shrink-0",
                  title: "Delete message",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }, `msg-${msg.id}-${idx}`);
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-background border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSend, className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer p-2 hover:bg-muted rounded-full transition-colors relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", className: "hidden", accept: "*/*", onChange: handleImageUpload, disabled: uploading }),
          uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-5 w-5 text-muted-foreground" })
        ] }),
        isRecording ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-3 bg-red-50 text-red-500 rounded-full px-4 h-10 border border-red-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium font-mono text-sm", children: formatDuration(recordingDuration) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm opacity-80 flex-1", children: "Recording..." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: newMessage,
            onChange: (e) => setNewMessage(e.target.value),
            placeholder: `Message ${getTopicDisplayName()}...`,
            className: "flex-1 rounded-full bg-muted/50 border-transparent focus-visible:bg-background",
            disabled: uploading
          }
        ),
        newMessage.trim() === "" && !uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            size: "icon",
            variant: isRecording ? "destructive" : "secondary",
            className: "rounded-full shrink-0 transition-colors",
            onClick: isRecording ? stopRecording : startRecording,
            children: isRecording ? /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" })
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "icon", className: "rounded-full shrink-0", disabled: !newMessage.trim() && !uploading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
      ] }) })
    ] }),
    profileTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
      UserProfileModal,
      {
        userTarget: profileTarget,
        allOrders,
        profileMode,
        onClose: () => setProfileTarget(null),
        onMessage: () => {
          setTopic(getDMTopicId(currentUser, profileTarget.username));
          setProfileTarget(null);
          setMobileView("chat");
        }
      }
    )
  ] });
}
export {
  MessagesView as default
};
