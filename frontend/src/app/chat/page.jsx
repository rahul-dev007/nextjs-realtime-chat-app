"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";

let socket;

export default function ChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [user, setUser] = useState(null);

useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/profile", {
        withCredentials: true, // ✅ must, otherwise cookie won't be sent
      });
      setUser(res.data.user);
      setLoading(false);
    } catch (err) {
      console.error("Auth check failed:", err.response?.data || err);
      router.push("/login"); // redirect if unauthorized
    }
  };
  checkAuth();
}, [router]);

  useEffect(() => {
    if (!loading) {
      socket = io("http://localhost:5000", { withCredentials: true });

      socket.on("loadMessages", (msgs) => setMessages(msgs));
      socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));
      socket.on("onlineUsers", (users) => setOnlineUsers(users));

      return () => socket.disconnect();
    }
  }, [loading]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit("sendMessage", { userId: user._id, content: message });
    setMessage("");
  };

  const logout = async () => {
    await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
    router.push("/login");
  };

  if (loading) return <div className="p-4 text-center">Checking authentication...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="p-4 bg-blue-500 text-white font-bold flex justify-between">
        <span>Realtime Chat</span>
        <div>
          <span className="mr-4">Online: {onlineUsers.length}</span>
          <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className="bg-white p-2 rounded shadow">
            <span className="font-bold">{msg.user.name}: </span> {msg.content}
            {user?.role === "admin" || user?.role === "superadmin" ? (
              <button
                className="ml-2 text-red-500"
                onClick={async () => {
                  await axios.delete(`http://localhost:5000/api/chat/${msg._id}`, { withCredentials: true });
                  setMessages(messages.filter((m) => m._id !== msg._id));
                }}
              >
                Delete
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 flex gap-2 bg-white border-t">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Send
        </button>
      </form>
    </div>
  );
}
