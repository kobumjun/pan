import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function validateNumericPassword(raw: string): boolean {
  if (!/^\d{4,8}$/.test(raw)) return false;
  return true;
}

export async function hashPassword(raw: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(raw, salt);
}

export async function comparePassword(raw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(raw, hash);
}

