import { useState, useRef, useEffect } from "react";
import { FiMessageSquare, FiX, FiSend, FiUser } from "react-icons/fi";
import { CONVERSATIONAL_SYSTEM_PROMPT } from "../data/cvData";
import { generateLocalAnswer } from "../utils/chatbotEngine";
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

const SUGGESTED_QUESTIONS = [
  "🤖 Tell me about Akarsh's ML research",
  "🎓 Education & M.Sc. Thesis",
  "🛠️ What technical stack does he use?",
  "✉️ How can I contact or hire Akarsh?",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inquiredRole, setInquiredRole] = useState<string>("Not Specified Yet");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "Hey there! 👋 Welcome to Akarsh's portfolio. I'm his personal AI assistant! How can I help you today? Feel free to ask me anything about his ML research, projects, or background.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatLogs, setChatLogs] = useState<ChatLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem("akarsh_portfolio_visitor_chat_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Silently save every log to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("akarsh_portfolio_visitor_chat_logs", JSON.stringify(chatLogs));
    } catch (err) {
      console.error("Failed to save chat logs:", err);
    }
  }, [chatLogs]);

  // Expose secret global download function for Akarsh in browser console: window.downloadAkarshChatLogs()
  useEffect(() => {
    (window as any).downloadAkarshChatLogs = () => {
      const logsToExport: ChatLogEntry[] = JSON.parse(
        localStorage.getItem("akarsh_portfolio_visitor_chat_logs") || "[]"
      );
      if (logsToExport.length === 0) {
        console.log("No visitor chat logs recorded yet.");
        alert("No visitor chat logs recorded yet.");
        return;
      }

      const headers = ["Timestamp", "Inquired Role", "Question", "Bot Response"];
      const rows = logsToExport.map((log) => [
        `"${log.timestamp.replace(/"/g, '""')}"`,
        `"${log.inquiredRole.replace(/"/g, '""')}"`,
        `"${log.question.replace(/"/g, '""')}"`,
        `"${log.answer.replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `akarsh_visitor_questions_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const recordLogEntry = (userQuestion: string, botAnswer: string) => {
    const entry: ChatLogEntry = {
      timestamp: new Date().toISOString(),
      inquiredRole: inquiredRole,
      question: userQuestion,
      answer: botAnswer,
    };
    setChatLogs((prev) => [...prev, entry]);
  };

  // Secret triple-click on chatbot title to trigger CSV log export for Akarsh
  const titleClickCount = useRef(0);
  const handleTitleClick = () => {
    titleClickCount.current += 1;
    if (titleClickCount.current >= 3) {
      titleClickCount.current = 0;
      if (typeof (window as any).downloadAkarshChatLogs === "function") {
        (window as any).downloadAkarshChatLogs();
      }
    }
    setTimeout(() => {
      titleClickCount.current = 0;
    }, 1500);
  };

  const processUserQuery = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userText = text.trim();
    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: userText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let currentInquiredRole = inquiredRole;
    if (inquiredRole === "Not Specified Yet" && messages.length <= 3) {
      currentInquiredRole = userText;
      setInquiredRole(userText);
    }

    let rawBotText = "";
    const isKeyValidFormat = GEMINI_API_KEY && GEMINI_API_KEY.length > 20 && !GEMINI_API_KEY.includes("your_gemini_api_key");

    if (isKeyValidFormat) {
      const candidateEndpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      ];

      for (const url of candidateEndpoints) {
        try {
          let res = await fetch(url, {
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
          });

          let result = await res.json();
          if (res.ok && !result.error && result.candidates?.[0]?.content?.parts?.[0]?.text) {
            rawBotText = result.candidates[0].content.parts[0].text;
            break;
          }

          // Fallback payload without system_instruction if rejected by endpoint
          res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                { role: "user", parts: [{ text: CONVERSATIONAL_SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Understood. I am ready to answer questions about Akarsh's background." }] },
                ...messages.slice(-6).map((m) => ({
                  role: m.sender === "bot" ? "model" : "user",
                  parts: [{ text: m.text }],
                })),
                { role: "user", parts: [{ text: userText }] },
              ],
            }),
          });

          result = await res.json();
          if (res.ok && !result.error && result.candidates?.[0]?.content?.parts?.[0]?.text) {
            rawBotText = result.candidates[0].content.parts[0].text;
            break;
          }
        } catch {
          // Ignore network error and proceed to local knowledge fallback
        }
      }
    }

    if (!rawBotText) {
      rawBotText = generateLocalAnswer(userText, currentInquiredRole, messages);
    }

    // Brief natural human typing delay (700ms) for an organic feel
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "bot", text: rawBotText }]);
      recordLogEntry(userText, rawBotText);
      setIsLoading(false);
    }, 700);
  };

  const handleSend = () => {
    processUserQuery(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-modal">
          <div className="chatbot-header">
            <div className="chatbot-header-info" onClick={handleTitleClick} title="Akarsh's Assistant">
              <div className="chatbot-avatar">
                <FiUser size={16} />
              </div>
              <div className="chatbot-header-text">
                <div className="chatbot-title">
                  Akarsh's Assistant
                </div>
                <div className="chatbot-status">
                  <span className="chatbot-dot"></span>
                  Online • Replies instantly
                </div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <FiX size={20} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-msg-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}
              >
                <div className={`chatbot-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                  {msg.text.split('\n').map((paragraph, idx) => (
                    <span key={idx}>
                      {paragraph}
                      {idx < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {messages.length <= 2 && !isLoading && (
              <div className="chatbot-suggestions">
                <p className="chatbot-suggestions-title">Quick questions:</p>
                <div className="chatbot-chips">
                  {SUGGESTED_QUESTIONS.map((qText, i) => (
                    <button
                      key={i}
                      className="chatbot-chip"
                      onClick={() => processUserQuery(qText)}
                    >
                      {qText}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              placeholder="Ask a question or state a role..."
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

