const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;
const PLAYER_NAME_REGEX = /^[\u0600-\u06FFa-zA-Z0-9 _.-]{1,20}$/;

export function normalizeRoomCode(value) {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().toUpperCase().replace(/\s+/g, '');
  return ROOM_CODE_REGEX.test(cleaned) ? cleaned : null;
}

export function normalizePlayerName(value) {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().replace(/\s+/g, ' ');
  return PLAYER_NAME_REGEX.test(cleaned) ? cleaned : null;
}

export function extractRoomCodeFromScan(raw) {
  if (!raw) return null;
  const text = Array.isArray(raw) ? raw[0]?.rawValue : raw;
  if (typeof text !== 'string') return null;

  try {
    const parsedUrl = new URL(text);
    return normalizeRoomCode(parsedUrl.searchParams.get('join') || '');
  } catch {
    return normalizeRoomCode(text);
  }
}
