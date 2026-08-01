import { useState, useRef, useEffect } from "react";
import { FiMessageSquare, FiX, FiSend, FiCpu, FiBarChart2, FiBookOpen, FiGlobe } from "react-icons/fi";
import { ROLES_DATA, RoleType, BASE_SYSTEM_GUARDRAILS } from "../data/cvData";
import "./Chatbot.css";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

const ROLE_ICONS: Record<RoleType, React.ReactNode> = {
  ai_engineer: <FiCpu size={13} />,
  data_scientist: <FiBarChart2 size={13} />,
  ml_researcher: <FiBookOpen size={13} />,
  environmental_analyst: <FiGlobe size={13} />,
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType>("ai_engineer");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: ROLES_DATA["ai_engineer"].initialMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, selectedRole]);

  const handleRoleChange = (newRole: RoleType) => {
    if (newRole === selectedRole) return;
    setSelectedRole(newRole);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "bot",
        text: `Switched focus persona to **${ROLES_DATA[newRole].title}**! ${ROLES_DATA[newRole].initialMessage}`,
      },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const activeRole = ROLES_DATA[selectedRole];
    const systemPrompt = `
      You are Akarsh's AI assistant specialized in his background as an ${activeRole.title}.
      ROLE SPECIFIC HIGHLIGHTS:
      ${activeRole.promptHighlights}
      
      ${BASE_SYSTEM_GUARDRAILS}
    `;

    try {
      if (!GEMINI_API_KEY) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              sender: "bot",
              text: "I'm running in demo mode because no API key is set. Please add VITE_GEMINI_API_KEY in your ak.env file!",
            },
          ]);
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
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...messages.slice(-5).map((m) => ({
                role: m.sender === "bot" ? "model" : "user",
                parts: [{ text: m.text }],
              })),
              { role: "user", parts: [{ text: userMessage.text }] },
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
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: "Oops, an error occurred while connecting to my brain: " + error.message,
        },
      ]);
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
              Akarsh AI
              <span className="role-active-badge" style={{ borderColor: ROLES_DATA[selectedRole].badgeColor }}>
                {ROLES_DATA[selectedRole].shortLabel}
              </span>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>
              <FiX size={20} />
            </button>
          </div>

          {/* Multi-Role Selector Tab Bar */}
          <div className="chatbot-role-bar">
            {(Object.keys(ROLES_DATA) as RoleType[]).map((roleKey) => {
              const role = ROLES_DATA[roleKey];
              const isActive = roleKey === selectedRole;
              return (
                <button
                  key={roleKey}
                  className={`role-tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleRoleChange(roleKey)}
                  title={role.description}
                >
                  <span className="role-icon">{ROLE_ICONS[roleKey]}</span>
                  <span className="role-label">{role.shortLabel}</span>
                </button>
              );
            })}
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
              placeholder={`Ask about ${ROLES_DATA[selectedRole].title} experience...`}
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
