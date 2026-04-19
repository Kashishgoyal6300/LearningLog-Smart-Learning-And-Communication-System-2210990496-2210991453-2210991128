import { createContext, useContext, useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { AuthContext } from "./AuthContext";
import { useToast } from "./ToastContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { token, role, user } = useContext(AuthContext); // 'user' is the profile loaded containing email
  const { showToast } = useToast();
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadRooms, setUnreadRooms] = useState([]);
  const [lastMessageTime, setLastMessageTime] = useState(null);
  
  // For Admin: Currently selected user's room (email)
  const [activeRoom, setActiveRoom] = useState(null);
  const activeRoomRef = useRef(null);

  // Keep ref in sync for the WebSocket callback
  useEffect(() => {
    activeRoomRef.current = activeRoom;
    if (activeRoom) {
      // Clear unread mark when room becomes active
      setUnreadRooms(prev => prev.filter(r => r !== activeRoom));
    }
  }, [activeRoom]);

  useEffect(() => {
    // Only connect if there is a token and user email is loaded
    if (!token || !user?.email) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      const upperRole = role ? role.toUpperCase() : "";
      console.log("🔌 WebSocket Connected. Role:", role, "Normalized:", upperRole, "User:", user.email);
      
      // Global debug tool for the admin
      window.testAdminToast = () => showToast("🔔 Test Notification", "success");

      // ADMIN specific: Subscribe to all message notifications
      // For debugging, we subscribe unconditionally and log everything
      console.log("📢 Subscribing to GLOBAL TOPIC [/topic/admin/notifications]");
      client.subscribe("/topic/admin/notifications", (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log("📥 [GLOBAL TOPIC] Received:", receivedMessage);
        setLastMessageTime(new Date().toLocaleTimeString());
        
        if (upperRole === "ADMIN") {
           console.log("🛡️ Admin logic processing message...");
           // Only notify if message is from a USER role (or any sender that isn't us)
           const isFromUser = receivedMessage.senderRole === "USER";
           const isNotMe = receivedMessage.senderEmail !== user.email;

           if (isFromUser && isNotMe) {
              // If NOT the current active room, mark as unread and show toast
              if (activeRoomRef.current !== receivedMessage.room) {
                 console.log(`✨ NEW UNREAD in room ${receivedMessage.room}`);
                 setUnreadRooms(prev => {
                   if (prev.includes(receivedMessage.room)) return prev;
                   return [...prev, receivedMessage.room];
                 });
                 showToast(`📩 New message from ${receivedMessage.senderEmail}`, "info");
              } else {
                 console.log("💬 Message is for current active room. No toast.");
              }
           } else {
              console.log("⏭️ Skipping notification (Self-message or Non-user sender)");
           }
        }
      });

      // USER specific: Subscribe to their own room
      if (upperRole === "USER") {
        console.log("🏠 Subscribing to PERSONAL ROOM:", user.email);
        client.subscribe(`/topic/chat/${user.email}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      }
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"]);
      setIsConnected(false);
    };

    client.activate();
    setStompClient(client);

    return () => {
      console.log("Deactivating WebSocket client");
      client.deactivate();
    };
  }, [token, user?.email, role]);

  // Handle Admin subscribing to a specific room for history/active chat
  useEffect(() => {
    if (role === "ADMIN" && stompClient && isConnected && activeRoom) {
      console.log("Admin subscribing to active room:", activeRoom);
      const subscription = stompClient.subscribe(`/topic/chat/${activeRoom}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, receivedMessage]);
      });

      return () => {
        console.log("Admin unsubscribing from room:", activeRoom);
        subscription.unsubscribe();
      };
    }
  }, [role, stompClient, isConnected, activeRoom]);

  // API to send a message
  const sendMessage = (room, content) => {
    if (stompClient && stompClient.connected) {
      const messageDto = {
        room: room,
        senderEmail: user.email,
        senderRole: role,
        content: content,
      };
      stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(messageDto),
      });
    } else {
      console.warn("Cannot send message: WebSocket not connected");
      showToast("Message not sent. Check connection.", "error");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        sendMessage,
        isConnected,
        stompClient,
        activeRoom,
        setActiveRoom,
        unreadRooms,
        setUnreadRooms,
        lastMessageTime
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
