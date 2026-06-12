const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateRoomId = (): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => CHARSET[b % CHARSET.length])
    .join('');

export const getOrCreatePlayerId = (): string => {
  const key = 'lifetool_player_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
};

export const isRoomHost = (gameKey: string, roomId: string): boolean =>
  localStorage.getItem(`lifetool_${gameKey}_host_${roomId}`) === 'true';

export const registerAsHost = (gameKey: string, roomId: string): void =>
  void localStorage.setItem(`lifetool_${gameKey}_host_${roomId}`, 'true');

export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const getRoomUrlParam = (): string | null =>
  new URLSearchParams(window.location.search).get('room');

export const setRoomUrlParam = (roomId: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set('room', roomId);
  window.history.replaceState({}, '', url.toString());
};

export const clearRoomUrlParam = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete('room');
  window.history.replaceState({}, '', url.toString());
};
