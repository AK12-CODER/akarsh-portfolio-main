import { useState, useRef, useEffect } from "react";
import { FiMessageSquare, FiX, FiSend, FiDownload } from "react-icons/fi";
import { CONVERSATIONAL_SYSTEM_PROMPT } from "../data/cvData";
import "./Chatbot.css";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

export interface ChatLogEntry {
  timestamp: string;
  inquiredRole: string;
  question: string;
  answer: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inquiredRole, setInquiredRole] = useState<string>("Not Specified Yet");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "Hi! I am Akarsh's AI Assistant. Which role or position are you inquiring about regarding Akarsh?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatLogs, setChatLogs] = useState<ChatLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem("akarsh_chatbot_csv_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("akarsh_chatbot_csv_logs", JSON.stringify(chatLogs));
    } catch (err) {
      console.error("Failed to save chat logs:", err);
    }
  }, [chatLogs]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const recordLogEntry = (userQuestion: string, botAnswer: string) => {
    const entry: ChatLogEntry = {
      timestamp: new Date().toISOString(),
      inquiredRole: inquiredRole,
      question: userQuestion,
      answer: botAnswer,
    };
    setChatLogs((prev) => [...prev, entry]);
  };

  const downloadCSV = () => {
    if (chatLogs.length === 0) {
      alert("No question logs recorded yet!");
      return;
    }

    const headers = ["Timestamp", "Inquired Role", "Question", "Bot Response"];
    const rows = chatLogs.map((log) => [
      `"${log.timestamp.replace(/"/g, '""')}"`,
      `"${log.inquiredRole.replace(/"/g, '""')}"`,
      `"${log.question.replace(/"/g, '""')}"`,
      `"${log.answer.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `akarsh_chatbot_questions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: userText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simple heuristic to detect if user specified a role in early interaction
    if (inquiredRole === "Not Specified Yet" && messages.length <= 3) {
      setInquiredRole(userText);
    }

    try {
      if (!GEMINI_API_KEY) {
        setTimeout(() => {
          const fallbackText =
            "I'm running in demo mode because no API key is set. Please add VITE_GEMINI_API_KEY in your ak.env file!";
          setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "bot", text: fallbackText }]);
          recordLogEntry(userText, fallbackText);
          setIsLoading(false);
        }, 1000);
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: CONVERSATIONAL_SYSTEM_PROMPT }] },
            contents: [
              ...messages.slice(-6).map((m) => ({
                role: m.sender === "bot" ? "model" : "user",
                parts: [{ text: m.text }],
              })),
              { role: "user", parts: [{ text: userText }] },
            ],
          }),
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }
      const botText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";

      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "bot", text: botText }]);
      recordLogEntry(userText, botText);
    } catch (error: any) {
      console.error(error);
      const errorText = "Oops, an error occurred while connecting to my brain: " + error.message;
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "bot", text: errorText }]);
      recordLogEntry(userText, errorText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="chatbot-dot"></span>
              Akarsh AI Assistant
            </div>
            <div className="chatbot-header-actions">
              <button
                className="chatbot-action-btn"
                onClick={downloadCSV}
                title={`Download CSV log (${chatLogs.length} questions recorded)`}
              >
                <FiDownload size={16} />
                <span className="log-count">{chatLogs.length}</span>
              </button>
              <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                <FiX size={20} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-msg-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}
              >
                <div className={`chatbot-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-msg-row bot-row">
                <div className="chatbot-bubble bot-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="State a role or ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <FiSend size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <FiMessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
