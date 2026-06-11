import { supabase } from "./supabase";

export type SpinRoom = {
  id: string;
  items: string[];
  current_angle: number;
  is_spinning: boolean;
  last_result: string | null;
  spin_target_angle: number | null;
  spin_duration_ms: number | null;
  spin_started_at: string | null;
  viewer_count: number;
  host_id: string;
  created_at: string;
  updated_at: string;
};

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function getOrCreateHostId(): string {
  const key = "lifetool_host_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  const id = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  localStorage.setItem(key, id);
  return id;
}

function genRoomId(): string {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}

export async function createSpinRoom(hostId: string, items: string[], currentAngle: number): Promise<SpinRoom | null> {
  const id = genRoomId();
  const { data, error } = await supabase
    .from("spin_rooms")
    .insert({ id, host_id: hostId, items, current_angle: currentAngle, is_spinning: false })
    .select()
    .single();
  if (error) return null;
  return data as SpinRoom;
}

export async function fetchSpinRoom(code: string): Promise<SpinRoom | null> {
  const { data, error } = await supabase
    .from("spin_rooms")
    .select("*")
    .eq("id", code.toUpperCase().trim())
    .single();
  if (error) return null;
  return data as SpinRoom;
}

export async function setViewerCount(roomId: string, count: number): Promise<void> {
  await supabase.from("spin_rooms").update({ viewer_count: count }).eq("id", roomId);
}

export async function deleteSpinRoom(roomId: string): Promise<void> {
  await supabase.from("spin_rooms").delete().eq("id", roomId);
}

export async function updateRoomItems(roomId: string, items: string[]): Promise<void> {
  await supabase
    .from("spin_rooms")
    .update({ items, updated_at: new Date().toISOString() })
    .eq("id", roomId);
}

export async function broadcastSpinStart(
  roomId: string,
  targetAngle: number,
  durationMs: number,
  startedAt: string,
): Promise<void> {
  await supabase.from("spin_rooms").update({
    is_spinning: true,
    spin_target_angle: targetAngle,
    spin_duration_ms: durationMs,
    spin_started_at: startedAt,
    updated_at: new Date().toISOString(),
  }).eq("id", roomId);
}

export async function broadcastSpinEnd(
  roomId: string,
  result: string,
  finalAngle: number,
): Promise<void> {
  await supabase.from("spin_rooms").update({
    is_spinning: false,
    last_result: result,
    current_angle: finalAngle,
    spin_target_angle: null,
    spin_duration_ms: null,
    spin_started_at: null,
    updated_at: new Date().toISOString(),
  }).eq("id", roomId);
}
