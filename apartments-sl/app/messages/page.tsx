"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaHome,
  FaComments,
  FaCircle,
} from "react-icons/fa";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
};

type Conversation = {
  key: string; // `${apartment_id}::${other_user_id}`
  apartment_id: string;
  apartment_title: string;
  apartment_image: string | null;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_at: string;
  unread: number;
  messages: Message[];
};

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // URL params: ?to=<user_id>&apartment=<apartment_id>
  const toParam = searchParams.get("to");
  const aptParam = searchParams.get("apartment");

  const toKey = (aptId: string, userId: string) => `${aptId}::${userId}`;

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select(
        `id, content, sender_id, recipient_id, apartment_id, created_at, read_at,
         sender:users!messages_sender_id_fkey(id, full_name),
         recipient:users!messages_recipient_id_fkey(id, full_name),
         apartment:apartments!messages_apartment_id_fkey(id, title, apartment_images(url))`,
      )
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Could not load messages");
      return;
    }

    // Group into conversations
    const map = new Map<string, Conversation>();

    for (const m of data ?? []) {
      const other =
        m.sender_id === user.id ? (m.recipient as any) : (m.sender as any);
      const apt = m.apartment as any;
      if (!other || !apt) continue;

      const key = toKey(apt.id, other.id);
      const existing = map.get(key);
      const msg: Message = {
        id: m.id,
        content: m.content,
        sender_id: m.sender_id,
        created_at: m.created_at,
        read_at: m.read_at,
      };

      if (existing) {
        existing.messages.push(msg);
        existing.last_message = m.content;
        existing.last_at = m.created_at;
        if (m.recipient_id === user.id && !m.read_at) existing.unread++;
      } else {
        map.set(key, {
          key,
          apartment_id: apt.id,
          apartment_title: apt.title,
          apartment_image: apt.apartment_images?.[0]?.url ?? null,
          other_user_id: other.id,
          other_user_name: other.full_name ?? "User",
          last_message: m.content,
          last_at: m.created_at,
          unread: m.recipient_id === user.id && !m.read_at ? 1 : 0,
          messages: [msg],
        });
      }
    }

    const sorted = [...map.values()].sort(
      (a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime(),
    );
    setConversations(sorted);

    // Auto-open conversation from URL params or first conversation
    if (toParam && aptParam) {
      const urlKey = toKey(aptParam, toParam);
      setActiveKey(urlKey);
      // If not in list yet (no prior messages), we still allow opening
    } else if (sorted.length > 0 && !activeKey) {
      setActiveKey(sorted[0].key);
    }
  }, [user, toParam, aptParam]);

  useEffect(() => {
    if (user) {
      fetchMessages().finally(() => setLoading(false));
    }
  }, [user, fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => fetchMessages(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchMessages]);

  // Scroll to bottom when active conversation changes or new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeKey, conversations]);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (!activeKey || !user) return;
    const conv = conversations.find((c) => c.key === activeKey);
    if (!conv) return;
    const unreadIds = conv.messages
      .filter((m) => m.sender_id !== user.id && !m.read_at)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds)
      .then(() => fetchMessages());
  }, [activeKey]);

  const sendMessage = async () => {
    if (!newText.trim() || !activeKey || !user) return;
    setSending(true);

    const conv = conversations.find((c) => c.key === activeKey);
    // If conversation from URL params but not yet in list
    const recipientId = conv?.other_user_id ?? toParam;
    const aptId = conv?.apartment_id ?? aptParam;

    if (!recipientId || !aptId) {
      toast.error("Cannot determine recipient");
      setSending(false);
      return;
    }

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: recipientId,
      apartment_id: aptId,
      content: newText.trim(),
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewText("");
      await fetchMessages();
    }
    setSending(false);
  };

  const activeConv = conversations.find((c) => c.key === activeKey) ?? null;

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <FaComments className="text-gray-300 text-5xl mx-auto" />
          <p className="text-gray-600">Please sign in to view your messages</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-black text-gray-900">Messages</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full px-0 sm:px-4 py-0 sm:py-6 gap-0 sm:gap-4">
          {/* Conversation list */}
          <div
            className={`w-full sm:w-80 flex-shrink-0 bg-white sm:rounded-2xl sm:border border-gray-100 flex flex-col overflow-hidden ${activeKey ? "hidden sm:flex" : "flex"}`}
          >
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Conversations
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <FaComments className="text-gray-200 text-4xl mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No messages yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.key}
                    onClick={() => setActiveKey(conv.key)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${activeKey === conv.key ? "bg-green-50" : ""}`}
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {conv.apartment_image ? (
                        <Image
                          src={conv.apartment_image}
                          alt={conv.apartment_title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaHome className="text-gray-300 text-xl" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {conv.other_user_name}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {fmtTime(conv.last_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.apartment_title}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {conv.last_message}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 self-center">
                        {conv.unread}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Thread panel */}
          <div
            className={`flex-1 bg-white sm:rounded-2xl sm:border border-gray-100 flex flex-col overflow-hidden ${activeKey ? "flex" : "hidden sm:flex"}`}
          >
            {!activeConv && !(toParam && aptParam) ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FaComments className="text-gray-200 text-5xl mx-auto mb-3" />
                  <p className="text-gray-400">Select a conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setActiveKey(null)}
                    className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                  >
                    <FaArrowLeft className="text-sm" />
                  </button>
                  {activeConv ? (
                    <>
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {activeConv.apartment_image ? (
                          <Image
                            src={activeConv.apartment_image}
                            alt={activeConv.apartment_title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <FaHome className="text-gray-300 m-auto" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {activeConv.other_user_name}
                        </p>
                        <Link
                          href={`/apartments/${activeConv.apartment_id}`}
                          className="text-xs text-green-600 hover:underline"
                        >
                          {activeConv.apartment_title}
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="font-bold text-gray-700 text-sm">
                      New Conversation
                    </p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {activeConv?.messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? "bg-green-600 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-[10px] mt-1 text-right ${isMe ? "text-green-200" : "text-gray-400"}`}
                          >
                            {fmtTime(msg.created_at)}
                            {isMe && msg.read_at && (
                              <span className="ml-1">· Read</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {(!activeConv || activeConv.messages.length === 0) && (
                    <p className="text-center text-sm text-gray-400 py-8">
                      Send the first message
                    </p>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-colors placeholder:text-gray-400"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newText.trim()}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-xl transition-colors"
                  >
                    {sending ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FaPaperPlane className="text-sm" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
