import { useState, useEffect, useRef } from "react";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import { Send, Hash, Plus } from "lucide-react";

export default function ChatPage() {
  const [channels] = useState([
    { id: 1, name: "general" },
  ]);

  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");  

  const socketRef = useRef(null);

  // Load current user email (from localStorage/JWT/etc.)
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setCurrentUserEmail( user || "");
    }
  }, []);

  
  const getUsername = (email) => email ? email.split('@')[0] : "other";

  // Connect WebSocket (unchanged, but good)
  useEffect(() => {
    if (!activeChannel) return;

    const token = localStorage.getItem("access");
    const socket = new WebSocket(
      `ws://localhost:8000/ws/chat/1/?token=${token}`
    );

    socketRef.current = socket; 

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          user: data.user, 
          text: data.message,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socketRef.current?.close();
    };
  }, [activeChannel]);

  // Send via WebSocket (unchanged)
  function sendMessage() {
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        message: input,
      })
    );

    setInput("");
  }

  // JSX with FIXED message display
  return (
    <WorkspaceLayout>
      <div className="flex h-full">
        {/* Sidebar - unchanged */}
        <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1f21] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Channels
            </h2>
            <Plus size={16} className="cursor-pointer text-gray-500 hover:text-indigo-500" />
          </div>
          <div className="space-y-1">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  setMessages([]); 
                  setActiveChannel(ch);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                  ${
                    activeChannel.id === ch.id
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <Hash size={14} />
                {ch.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#151617]">
          {/* Header - unchanged */}
          <div className="h-14 px-4 flex items-center border-b border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200">
            #{activeChannel.name}
          </div>

          {/* Messages - FIXED */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((msg) => {
              const username = getUsername(msg.user); 
              const isMe = msg.user === currentUserEmail;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} space-x-2 space-x-reverse`}>
                  <div className={`max-w-xs px-3 py-1 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-indigo-500 text-white ml-4' 
                      : 'bg-white dark:bg-[#2c2d30] mr-4'
                  }`}>
                    <span>{msg.text}</span>
                  </div>
                  <span className="text-xs text-gray-500 self-end min-w-fit">
                    {isMe ? 'You' : username} • {msg.time}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Input - unchanged */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1f21]">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Message #${activeChannel.name}`}
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-[#2c2d30] text-gray-700 dark:text-gray-300 outline-none"
              />
              <button
                onClick={sendMessage}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </WorkspaceLayout>
  );
}
