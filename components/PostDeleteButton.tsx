"use client";

import { FormEvent, useState } from "react";

interface Props {
  postId: string;
}

export default function PostDeleteButton({ postId }: Props) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setPassword("");
    setLoading(false);
  }

  function handleOpen() {
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(password)) {
      alert("숫자 비밀번호 4~8자리를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "삭제에 실패했습니다.");
        setLoading(false);
        return;
      }
      window.location.href = "/";
    } catch {
      alert("삭제 처리 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="btn-danger"
      >
        삭제하기
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-400 px-4 py-3 w-72 text-sm space-y-3"
          >
            <div className="font-semibold text-gray-800">비밀번호 확인</div>
            <div className="space-y-1">
              <label className="block text-xs text-gray-600">
                숫자 비밀번호 4~8자리
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 px-2 py-1 text-sm w-full"
                maxLength={8}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="btn-secondary"
              >
                취소
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                확인
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

