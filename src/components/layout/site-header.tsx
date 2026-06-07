import Link from "next/link";
import { Heart, Search, ShoppingCart, User } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-[#2a2f36] bg-[#0b0d10] text-stone-100">
      <div className="border-b border-amber-900/40 bg-[#8b744d] px-4 py-2 text-center text-xs text-amber-50">
        Ưu đãi khai trương - Giảm đến 15% cho tất cả laptop | Miễn phí vận
        chuyển toàn quốc
      </div>

      <div className="mx-auto flex h-20 max-w-7xl items-center gap-8 px-6">
        <Link href="/" className="text-2xl font-semibold tracking-[0.35em]">
          LAPORA
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-stone-300 md:flex">
          <Link href="/" className="text-stone-100">
            Trang chủ
          </Link>
          <Link href="/products" className="hover:text-amber-300">
            Sản phẩm
          </Link>
          <span className="cursor-default hover:text-amber-300">Bộ sưu tập</span>
          <span className="cursor-default hover:text-amber-300">Khuyến mãi</span>
          <span className="cursor-default hover:text-amber-300">Hỗ trợ</span>
        </nav>

        <div className="ml-auto hidden h-11 w-64 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 lg:flex">
          <input
            placeholder="Tìm kiếm laptop..."
            className="w-full bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
          />
          <Search size={18} className="text-stone-400" />
        </div>

        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <User size={20} className="text-stone-300" />
          <Heart size={20} className="text-stone-300" />
          <div className="relative">
            <ShoppingCart size={21} className="text-stone-300" />
            <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-amber-600 text-[10px] text-white">
              0
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
