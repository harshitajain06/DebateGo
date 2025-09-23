import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";
import { MessageSquare, Send, Users, Crown, Shield, User } from "lucide-react";

const Chat = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showOnlyAdmins, setShowOnlyAdmins] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let role = "user";
    if (currentUser?.uid) {
      const userDoc = await getDoc(doc(db, "DebateGoUsers", currentUser.uid));
      if (userDoc.exists()) {
        role = userDoc.data().role || "user";
      }
    }

    await addDoc(collection(db, "messages"), {
      text: input,
      email: currentUser?.email,
      displayName: role === "admin" ? "Admin" : currentUser?.displayName || "Anonymous",
      role,
      timestamp: serverTimestamp(),
    });

    setInput("");
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Community Chat</h1>
                <p className="text-slate-600 text-sm">Connect with fellow debaters</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-slate-600">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">{messages.length} messages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Chat Messages Area */}
          <div className="h-[75vh] overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages yet</h3>
                <p className="text-slate-600">Start the conversation by sending a message below!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages
                  .filter((msg) => !showOnlyAdmins || msg.role === "admin")
                  .map((msg) => {
                    const isCurrentUser = msg.email === currentUser?.email;
                    const isAdmin = msg.role === "admin";

                    const displayName =
                      isCurrentUser
                        ? "You"
                        : isAdmin
                        ? "Admin"
                        : msg.displayName || "Anonymous";

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-4 ${
                          isCurrentUser ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                              isAdmin 
                                ? "bg-gradient-to-r from-red-500 to-red-600" 
                                : isCurrentUser
                                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                : "bg-gradient-to-r from-slate-500 to-slate-600"
                            }`}
                          >
                            {isAdmin ? (
                              <Crown className="w-6 h-6 text-white" />
                            ) : isCurrentUser ? (
                              <User className="w-6 h-6 text-white" />
                            ) : (
                              <span className="text-white font-semibold text-sm">
                                {getInitials(displayName)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 max-w-6xl ${isCurrentUser ? "text-right" : "text-left"}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-slate-900 text-sm">
                              {displayName}
                            </span>
                            {isAdmin && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                <Crown className="w-3 h-3" />
                                Admin
                              </div>
                            )}
                            {msg.timestamp?.toDate && (
                              <span className="text-slate-500 text-xs">
                                {format(msg.timestamp.toDate(), "MMM d, h:mm a")}
                              </span>
                            )}
                          </div>
                          
                          <div
                            className={`inline-block rounded-2xl px-6 py-4 shadow-sm ${
                              isCurrentUser
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                : isAdmin
                                ? "bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-900"
                                : "bg-white border border-slate-200 text-slate-900"
                            }`}
                          >
                            <p className="text-base leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white p-6">
            <form onSubmit={handleSend} className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-6 py-4 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base placeholder-slate-400"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
