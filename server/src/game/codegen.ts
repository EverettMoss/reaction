const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no O or I to avoid confusion

export function generateRoomCode(existingCodes: Set<string>): string {
  let code: string;
  do {
    code = Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
  } while (existingCodes.has(code));
  return code;
}
