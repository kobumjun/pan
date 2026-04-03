"use client";

import { FormEvent, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  confirmLabel?: string;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<void>;
};

export default function PinModal({
  open,
  title,
  confirmLabel = "확인",
  onClose,
  onSubmit
}: Props) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) {
      alert("숫자 비밀번호 4~6자리를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(pin);
      setPin("");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "처리에 실패했습니다.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200/90 bg-pan-card p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="4~6자리 숫자"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setPin("");
                onClose();
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-pan-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-pan-accent-hover disabled:opacity-50"
            >
              {loading ? "…" : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
