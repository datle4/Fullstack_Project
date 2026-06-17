"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LoaderCircle,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  User,
} from "lucide-react";

type UserMenuProps = {
  user: {
    name: string | null;
    email: string;
    role: "USER" | "ADMIN";
  };
};

const menuItems = [
  {
    href: "/profile",
    label: "Hồ sơ cá nhân",
    icon: User,
  },
  {
    href: "/orders",
    label: "Đơn hàng của tôi",
    icon: Package,
  },
  {
    href: "/profile/addresses",
    label: "Địa chỉ giao hàng",
    icon: MapPin,
  },
];

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        return;
      }

      setIsOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Mở menu tài khoản"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 text-stone-300 transition hover:text-[#e3c98d]"
      >
        <User size={20} />
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          style={{
            right: 0,
            width: "min(336px, calc(100vw - 24px))",
            zIndex: 1100,
          }}
          className="absolute top-full mt-3 overflow-hidden rounded-lg border border-[#2a2f36] bg-[#14171b] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
        >
          <div className="border-b border-white/10 px-5 py-5">
            <p className="truncate text-base font-semibold text-stone-100">
              {user.name ?? "Tài khoản"}
            </p>
            <p className="mt-1.5 truncate text-sm text-stone-500">
              {user.email}
            </p>
          </div>

          <div className="p-2.5">
            {menuItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex min-h-12 items-center gap-3.5 whitespace-nowrap rounded-md px-4 py-3 text-[15px] text-stone-300 transition hover:bg-white/[0.05] hover:text-[#e3c98d]"
              >
                <Icon size={19} />
                {label}
              </Link>
            ))}

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex min-h-12 items-center gap-3.5 whitespace-nowrap rounded-md px-4 py-3 text-[15px] text-stone-300 transition hover:bg-white/[0.05] hover:text-[#e3c98d]"
              >
                <ShieldCheck size={19} />
                Quản trị
              </Link>
            )}
          </div>

          <div className="border-t border-white/10 p-2.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex min-h-12 w-full items-center gap-3.5 rounded-md px-4 py-3 text-[15px] text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoggingOut ? (
                <LoaderCircle size={19} className="animate-spin" />
              ) : (
                <LogOut size={19} />
              )}
              {isLoggingOut ? "Đang đăng xuất" : "Đăng xuất"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
