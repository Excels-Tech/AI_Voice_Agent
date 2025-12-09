import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { X, Send, Paperclip, Smile, Minimize2, Maximize2, User, Bot } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  agentName?: string;
  agentAvatar?: string;
  attachment?: {
    name: string;
    size: number;
    type: string;
  };
}

interface LiveChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LiveChatDialog({ isOpen, onClose }: LiveChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [agentStatus, setAgentStatus] = useState<"connecting" | "connected" | "offline">("connected");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Show welcome message instantly
      const welcomeMessage: Message = {
        id: "welcome",
        text: "Hi there! 👋 I'm Sarah from VoiceAI support. How can I help you today?",
        sender: "agent",
        timestamp: new Date(),
        agentName: "Sarah M.",
        agentAvatar: "SM",
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Simulate agent responses
  const simulateAgentResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      let responseText = "";
      const lowerMessage = userMessage.toLowerCase();

      // Smart responses based on keywords
      if (lowerMessage.includes("price") || lowerMessage.includes("pricing") || lowerMessage.includes("cost")) {
        responseText = "Our pricing starts at $29/month for the Starter plan with 500 minutes. We also offer Professional ($99/month) and Enterprise (custom pricing) plans. Would you like me to send you a detailed pricing breakdown?";
      } else if (lowerMessage.includes("agent") || lowerMessage.includes("voice")) {
        responseText = "Our voice agents can handle inbound and outbound calls 24/7 in over 40 languages! You can customize them with your own scripts, voice selection, and integrate with your CRM. What specific features are you interested in?";
      } else if (lowerMessage.includes("integration")) {
        responseText = "We integrate with popular CRMs like Salesforce, HubSpot, Zoho, and automation tools like Zapier, Make, and webhooks. Which platform would you like to connect?";
      } else if (lowerMessage.includes("support") || lowerMessage.includes("help")) {
        responseText = "I'm here to help! Our support team is available 24/7 via live chat, and email support typically responds within 2-4 hours. What issue can I assist you with?";
      } else if (lowerMessage.includes("language")) {
        responseText = "We support 40+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, and many more! Each agent can be configured to handle multiple languages with automatic detection.";
      } else if (lowerMessage.includes("trial") || lowerMessage.includes("free")) {
        responseText = "Yes! We offer a 14-day free trial with 100 minutes included - no credit card required. You can test all features and see how our voice agents work for your business. Would you like me to set that up for you?";
      } else if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
        responseText = "You're very welcome! 😊 Is there anything else I can help you with today?";
      } else if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
        responseText = "Thank you for chatting with us! Feel free to reach out anytime. Have a great day! 👋";
      } else {
        responseText = "Thanks for your message! Let me help you with that. Could you provide a bit more detail so I can give you the best answer?";
      }

      const agentMessage: Message = {
        id: Date.now().toString(),
        text: responseText,
        sender: "agent",
        timestamp: new Date(),
        agentName: "Sarah M.",
        agentAvatar: "SM",
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    }, 2000 + Math.random() * 1000); // Random delay between 2-3 seconds
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() && !attachedFile) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage || (attachedFile ? "Sent a file" : ""),
      sender: "user",
      timestamp: new Date(),
      attachment: attachedFile ? {
        name: attachedFile.name,
        size: attachedFile.size,
        type: attachedFile.type,
      } : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    
    // Clear attached file after sending
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Simulate agent response
    if (inputMessage) {
      simulateAgentResponse(inputMessage);
    } else if (attachedFile) {
      simulateAgentResponse("I sent you a file");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setAttachedFile(file);
      toast.success(`File attached: ${file.name}`);
    }
  };

  // Remove attached file
  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Common emojis for the picker
  const commonEmojis = [
    "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊",
    "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘",
    "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪",
    "🤨", "🧐", "🤓", "😎", "🥳", "😏", "😒", "😞",
    "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫",
    "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
    "👍", "👎", "👌", "✌️", "🤞", "🤝", "🙏", "💪",
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
    "💯", "✅", "❌", "⭐", "✨", "🔥", "💡", "🎉",
    "🎊", "🎈", "🎁", "🏆", "🥇", "🚀", "⚡", "💬",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 p-0 gap-0 max-w-md sm:max-w-lg overflow-hidden [&>button]:hidden">
        <DialogDescription className="sr-only">
          Live chat support dialog for VoiceAI customer support
        </DialogDescription>
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-full bg-white flex items-center justify-center text-blue-600">
                  <Bot className="size-6" />
                </div>
                {agentStatus === "connected" && (
                  <div className="absolute bottom-0 right-0 size-3 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <DialogTitle className="text-white text-base mb-0">VoiceAI Support</DialogTitle>
                <div className="flex items-center gap-2">
                  {agentStatus === "connecting" && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-xs h-5">
                      Connecting...
                    </Badge>
                  )}
                  {agentStatus === "connected" && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/50 text-xs h-5">
                      Online
                    </Badge>
                  )}
                  {agentStatus === "offline" && (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/50 text-xs h-5">
                      Offline
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 size-8 p-0"
              >
                {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 size-8 p-0"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        {!isMinimized && (
          <>
            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-950">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {message.sender === "agent" && (
                    <div className="size-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs shrink-0">
                      {message.agentAvatar || "AI"}
                    </div>
                  )}
                  {message.sender === "user" && (
                    <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                      <User className="size-4" />
                    </div>
                  )}
                  <div className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"} max-w-[75%]`}>
                    {message.sender === "agent" && message.agentName && (
                      <span className="text-slate-400 text-xs mb-1">{message.agentName}</span>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-sm"
                          : "bg-slate-800 text-slate-100 rounded-bl-sm"
                      }`}
                    >
                      {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}
                      {message.attachment && (
                        <div className={`${message.text ? "mt-2 pt-2 border-t" : ""} ${message.sender === "user" ? "border-white/20" : "border-slate-700"}`}>
                          <div className="flex items-center gap-2">
                            <Paperclip className={`size-4 ${message.sender === "user" ? "text-white/80" : "text-cyan-400"}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${message.sender === "user" ? "text-white" : "text-slate-200"}`}>
                                {message.attachment.name}
                              </p>
                              <p className={`text-xs ${message.sender === "user" ? "text-white/70" : "text-slate-400"}`}>
                                {(message.attachment.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-slate-500 text-xs mt-1">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="size-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs shrink-0">
                    SM
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <div className="size-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="size-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="size-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && (
              <div className="px-4 pb-3 bg-slate-950 border-t border-slate-800">
                <div className="flex flex-wrap gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputMessage("Tell me about pricing");
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-xs h-7"
                  >
                    💰 Pricing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputMessage("How do voice agents work?");
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-xs h-7"
                  >
                    🤖 Voice Agents
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputMessage("Do you offer a free trial?");
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-xs h-7"
                  >
                    ✨ Free Trial
                  </Button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              {/* Attached File Display */}
              {attachedFile && (
                <div className="mb-3 p-3 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="size-4 text-cyan-400" />
                    <span className="text-slate-300 text-sm">{attachedFile.name}</span>
                    <Badge className="bg-slate-700 text-slate-400 text-xs">
                      {(attachedFile.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-slate-400 hover:text-red-400 hover:bg-slate-700 size-7 p-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mb-3 bg-slate-800 rounded-lg border border-slate-700 p-3 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">Pick an emoji</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-slate-400 hover:text-white hover:bg-slate-700 size-6 p-0"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-xl hover:bg-slate-700 rounded p-1 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={agentStatus !== "connected"}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 pr-20 focus:border-cyan-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-slate-400 hover:text-white hover:bg-slate-700 size-8 p-0"
                    >
                      <Smile className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-slate-400 hover:text-white hover:bg-slate-700 size-8 p-0"
                    >
                      <Paperclip className="size-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() && !attachedFile || agentStatus !== "connected"}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shrink-0 h-10 px-4"
                >
                  <Send className="size-4" />
                </Button>
              </div>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              <p className="text-slate-500 text-xs mt-2 text-center">
                Average response time: 2 minutes
              </p>
            </div>
          </>
        )}

        {/* Minimized State */}
        {isMinimized && (
          <div className="p-6 bg-slate-950 text-center">
            <p className="text-slate-400 text-sm">Chat minimized - Click to expand</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}