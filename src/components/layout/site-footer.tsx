export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080a0c] text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-4">
        <div>
          <div className="text-2xl font-semibold tracking-[0.35em] text-white">
            LAPORA
          </div>
          <p className="mt-4 text-sm leading-6 text-stone-500">
            Laptop chính hãng cho học tập, làm việc và gaming. Tập trung vào
            cấu hình rõ ràng, giá minh bạch và trải nghiệm mua hàng gọn gàng.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Về LAPORA</h3>
          <ul className="mt-4 space-y-2 text-sm text-stone-500">
            <li>Giới thiệu</li>
            <li>Tuyển dụng</li>
            <li>Tin tức</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Chính sách</h3>
          <ul className="mt-4 space-y-2 text-sm text-stone-500">
            <li>Bảo hành</li>
            <li>Đổi trả</li>
            <li>Thanh toán</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">Liên hệ</h3>
          <ul className="mt-4 space-y-2 text-sm text-stone-500">
            <li>Hotline: 1900 1234</li>
            <li>Email: support@lapora.vn</li>
            <li>TP. Hồ Chí Minh</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}