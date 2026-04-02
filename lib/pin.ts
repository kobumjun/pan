import bcrypt from "bcryptjs";

const ROUNDS = 10;

/** 4~6자리 숫자 PIN */
export function validatePostPin(raw: string): boolean {
  return /^\d{4,6}$/.test(raw);
}

export async function hashPostPin(raw: string): Promise<string> {
  const salt = await bcrypt.genSalt(ROUNDS);
  return bcrypt.hash(raw, salt);
}

export async function comparePostPin(raw: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(raw, hash);
}
