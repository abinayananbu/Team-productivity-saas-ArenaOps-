import { useState } from "react";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import { Send, Hash, Plus } from "lucide-react";

export default function ChatPage() {
  const [channels] = useState(["general", "development", "design"]);
  const [activeChannel, setActiveChannel] = useState("general");

  const [messages, setMessages] = useState([
    { id: 1, user: "Anbu", text: "Welcome to ArenaOps 👋", time: "10:00 AM" },
    { id: 2, user: "John", text: "Let’s start the sprint!", time: "10:02 AM" },
  ]);

  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        user: "You",
        text: input,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInput("");
  }

  return (
    <WorkspaceLayout>
      <div className="flex h-full">

        {/* Sidebar */}
        <aside
          className="w-64 border-r border-gray-200 dark:border-gray-800
          bg-white dark:bg-[#1e1f21] p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Channels
            </h2>
            <Plus
              size={16}
              className="cursor-pointer text-gray-500 hover:text-indigo-500"
            />
          </div>

          <div className="space-y-1">
            {channels.map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                  ${
                    activeChannel === ch
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <Hash size={14} />
                {ch}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-gray-50 dark:bg-[#151617]">

          {/* Header */}
          <div
            className="h-14 px-4 flex items-center border-b
            border-gray-200 dark:border-gray-800
            text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            #{activeChannel}
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <span className="text-xs text-gray-500">
                  {msg.user} • {msg.time}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            className="p-4 border-t border-gray-200 dark:border-gray-800
            bg-white dark:bg-[#1e1f21]"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Message #${activeChannel}`}
                className="flex-1 px-3 py-2 rounded-lg text-sm
                  bg-gray-100 dark:bg-[#2c2d30]
                  text-gray-700 dark:text-gray-200
                  outline-none"
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
