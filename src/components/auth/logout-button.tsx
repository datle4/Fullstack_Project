"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="inline-flex items-center gap-2 text-sm text-stone-300 transition hover:text-[#e3c98d] disabled:opacity-50"
    >
      {isPending ? (
        <LoaderCircle size={18} className="animate-spin" />
      ) : (
        <LogOut size={18} />
      )}
      <span className="hidden xl:inline">Đăng xuất</span>
    </button>
  );
}