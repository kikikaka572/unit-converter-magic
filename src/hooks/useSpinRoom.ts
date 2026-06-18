import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  type SpinRoom,
  createSpinRoom,
  fetchSpinRoom,
  setViewerCount,
  deleteSpinRoom,
  updateRoomItems,
  broadcastSpinStart,
  broadcastSpinEnd,
  getOrCreateHostId,
} from "@/lib/spinRoom";

export type RoomRole = "host" | "viewer";

export type FloatingReaction = { id: number; emoji: string; x: number };

export interface ChatMessage {
  id: string;
  nickname: string;
  text: string;
  timestamp: number;
}

type Callbacks = {
  onSpinStart: (targetAngle: number, durationMs: number, startedAtMs: number, role: RoomRole | null) => void;
  onSpinEnd: (result: string, role: RoomRole | null) => void;
};

export function useSpinRoom(callbacks: Callbacks) {
  const [room, setRoom] = useState<SpinRoom | null>(null);
  const [role, setRole] = useState<RoomRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [participantCount, setParticipantCount] = useState(0);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef(callbacks);
  const roleRef = useRef<RoomRole | null>(null);
  const hostId = useRef(getOrCreateHostId());
  const reactionCounter = useRef(0);

  useEffect(() => { callbacksRef.current = callbacks; }, [callbacks]);
  useEffect(() => { roleRef.current = role; }, [role]);

  function addFloating(emoji: string) {
    const id = ++reactionCounter.current;
    const x = Math.random() * 60 + 20;
    setFloatingReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => setFloatingReactions((prev) => prev.filter((r) => r.id !== id)), 2200);
  }

  function subscribeToRoom(roomId: string) {
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`spin:${roomId}`, { config: { broadcast: { self: false } } })
      .on(
        // postgres_changes: persistent state only (items, viewer_count)
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "spin_rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          setRoom(payload.new as SpinRoom);
        },
      )
      // Broadcast: low-latency spin events (~50ms, no DB roundtrip)
      .on("broadcast", { event: "spin_start" }, (payload) => {
        const p = payload.payload as { targetAngle: number; durationMs: number; startedAt: string };
        const startedAtMs = new Date(p.startedAt).getTime();
        callbacksRef.current.onSpinStart(p.targetAngle, p.durationMs, startedAtMs, roleRef.current);
      })
      .on("broadcast", { event: "spin_end" }, (payload) => {
        const p = payload.payload as { result: string };
        callbacksRef.current.onSpinEnd(p.result, roleRef.current);
      })
      .on("broadcast", { event: "items_update" }, (payload) => {
        const p = payload.payload as { items: string[] };
        setRoom((prev) => prev ? { ...prev, items: p.items } : prev);
      })
      .on("broadcast", { event: "react" }, (payload) => {
        const emoji = (payload.payload as { emoji?: string }).emoji;
        if (emoji) addFloating(emoji);
      })
      .on("broadcast", { event: "chat" }, (payload) => {
        const msg = payload.payload as ChatMessage;
        if (msg?.id) setChatMessages(prev => [...prev.slice(-99), msg]);
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setParticipantCount(Object.values(state).flat().length);
      });

    channelRef.current = channel;

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ userId: hostId.current });
      }
    });
  }

  const createRoom = useCallback(async (items: string[], currentAngle: number) => {
    setLoading(true);
    setError(null);
    const r = await createSpinRoom(hostId.current, items, currentAngle);
    if (!r) {
      setError("룸 생성에 실패했습니다");
      setLoading(false);
      return null;
    }
    setRoom(r);
    setRole("host");
    subscribeToRoom(r.id);
    setLoading(false);
    return r;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const joinRoom = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    const r = await fetchSpinRoom(code);
    if (!r) {
      setError("룸을 찾을 수 없습니다");
      setLoading(false);
      return null;
    }
    await setViewerCount(r.id, r.viewer_count + 1);
    setRoom({ ...r, viewer_count: r.viewer_count + 1 });
    setRole("viewer");
    subscribeToRoom(r.id);
    setLoading(false);
    return r;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const leaveRoom = useCallback(async () => {
    if (!room) return;
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    if (roleRef.current === "host") {
      await deleteSpinRoom(room.id);
    } else {
      await setViewerCount(room.id, Math.max(1, room.viewer_count - 1));
    }
    setRoom(null);
    setRole(null);
    setError(null);
    setChatMessages([]);
    setParticipantCount(0);
  }, [room]);

  const syncItems = useCallback(async (items: string[]) => {
    if (!room || roleRef.current !== "host") return;
    await updateRoomItems(room.id, items);
  }, [room]);

  const notifyItemsUpdate = useCallback((items: string[]) => {
    if (!channelRef.current || roleRef.current !== "host") return;
    channelRef.current.send({
      type: "broadcast",
      event: "items_update",
      payload: { items },
    });
  }, []);

  const notifySpinStart = useCallback(async (targetAngle: number, durationMs: number, startedAt: string) => {
    if (!channelRef.current || roleRef.current !== "host") return;
    // Broadcast directly through channel — arrives in ~50ms without DB roundtrip
    channelRef.current.send({
      type: "broadcast",
      event: "spin_start",
      payload: { targetAngle, durationMs, startedAt },
    });
    // Also persist to DB so late joiners can sync on connect
    if (room) await broadcastSpinStart(room.id, targetAngle, durationMs, startedAt);
  }, [room]);

  const notifySpinEnd = useCallback(async (result: string, finalAngle: number) => {
    if (!channelRef.current || roleRef.current !== "host") return;
    channelRef.current.send({
      type: "broadcast",
      event: "spin_end",
      payload: { result },
    });
    if (room) await broadcastSpinEnd(room.id, result, finalAngle);
  }, [room]);

  const sendReaction = useCallback((emoji: string) => {
    if (!channelRef.current || !room) return;
    channelRef.current.send({ type: "broadcast", event: "react", payload: { emoji } });
    addFloating(emoji);
  }, [room]);

  const sendChatMessage = useCallback((nickname: string, text: string) => {
    if (!channelRef.current || !room || !text.trim()) return;
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nickname,
      text: text.trim().slice(0, 100),
      timestamp: Date.now(),
    };
    channelRef.current.send({ type: "broadcast", event: "chat", payload: msg });
    // self: false → add own message locally
    setChatMessages(prev => [...prev.slice(-99), msg]);
  }, [room]);

  useEffect(() => {
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, []);

  return {
    room,
    role,
    loading,
    error,
    floatingReactions,
    chatMessages,
    participantCount,
    createRoom,
    joinRoom,
    leaveRoom,
    syncItems,
    notifyItemsUpdate,
    notifySpinStart,
    notifySpinEnd,
    sendReaction,
    sendChatMessage,
  };
}
