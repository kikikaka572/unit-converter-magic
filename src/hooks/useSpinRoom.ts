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

    channelRef.current = supabase
      .channel(`spin:${roomId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "spin_rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          const updated = payload.new as SpinRoom;
          setRoom(updated);
          if (updated.is_spinning && updated.spin_target_angle != null && updated.spin_duration_ms != null && updated.spin_started_at) {
            const startedAtMs = new Date(updated.spin_started_at).getTime();
            callbacksRef.current.onSpinStart(updated.spin_target_angle, updated.spin_duration_ms, startedAtMs, roleRef.current);
          }
          if (!updated.is_spinning && updated.last_result) {
            callbacksRef.current.onSpinEnd(updated.last_result, roleRef.current);
          }
        },
      )
      .on("broadcast", { event: "react" }, (payload) => {
        const emoji = (payload.payload as { emoji?: string }).emoji;
        if (emoji) addFloating(emoji);
      })
      .subscribe();
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
  }, []);

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
  }, []);

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
  }, [room]);

  const syncItems = useCallback(async (items: string[]) => {
    if (!room || roleRef.current !== "host") return;
    await updateRoomItems(room.id, items);
  }, [room]);

  const notifySpinStart = useCallback(async (targetAngle: number, durationMs: number, startedAt: string) => {
    if (!room || roleRef.current !== "host") return;
    await broadcastSpinStart(room.id, targetAngle, durationMs, startedAt);
  }, [room]);

  const notifySpinEnd = useCallback(async (result: string, finalAngle: number) => {
    if (!room || roleRef.current !== "host") return;
    await broadcastSpinEnd(room.id, result, finalAngle);
  }, [room]);

  const sendReaction = useCallback((emoji: string) => {
    if (!channelRef.current || !room) return;
    channelRef.current.send({ type: "broadcast", event: "react", payload: { emoji } });
    addFloating(emoji);
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
    createRoom,
    joinRoom,
    leaveRoom,
    syncItems,
    notifySpinStart,
    notifySpinEnd,
    sendReaction,
  };
}
