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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
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
            className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setPin("");
                onClose();
              }}
              className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "…" : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
