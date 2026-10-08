import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0a0712] border-t border-stone-900 pt-20 pb-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-2xl font-serif text-white tracking-tight">Sagunthala</span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#b48a3c] font-bold">Dance Jewellers</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs font-light">
              Crafting timeless elegance since generations. Our temple jewellery is a tribute to divine craftsmanship and Indian heritage.
            </p>
            <div className="flex gap-4">
              {/* {['FB', 'IG', 'TW', 'YT'].map(social => (
                <div key={social} className="w-8 h-8 rounded-full border border-stone-800 flex items-center justify-center text-[10px] text-stone-500 hover:border-[#b48a3c] hover:text-[#b48a3c] transition-all cursor-pointer">
                  {social}
                </div>
              ))} */}
              <Link
                href="https://www.instagram.com/sagunthala_dance_jewellery/"
                target="_blank"
                className="w-8 h-8 rounded-full border border-stone-800 flex items-center justify-center text-stone-400 hover:border-[#b48a3c] hover:text-[#b48a3c] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </Link>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-white">The Boutique</h4>
            <div className="space-y-4 text-stone-400 text-sm font-light">
              <p className="flex items-start gap-3 italic">
                <span className="text-[#b48a3c]">Address:</span> 38/46, N Mada St, near Kapaleeshwarar Temple, Vinayaka Nagar Colony, Mylapore, Chennai, Tamil Nadu - 600004.
              </p>
              <p className="flex items-center gap-3 italic">
                <span className="text-[#b48a3c]">Phone:</span> +91 8189840100 / 7305873829
              </p>
              <p className="flex items-center gap-3 italic">
                <span className="text-[#b48a3c]">Email:</span> sagunthalajewellers@gmail.com
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-white">Collections</h4>
            <ul className="space-y-3">
              {['Temple Jewellery'].map(link => (
                <li key={link}>
                  <span className="text-stone-500 text-sm font-light">{link}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Policy */}
          <div className="space-y-6">
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-white">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Refund Policy', 'Terms & Conditions', 'Shipping Info'].map(link => (
                <li key={link}>
                  <span className="text-stone-500 text-sm font-light">{link}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">
            © {new Date().getFullYear()} Sagunthala Dance Jewellers. Handcrafted in India.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              {/* Placeholders for payment icons */}
              <div className="h-4 w-8 bg-stone-700 rounded-sm"></div>
              <div className="h-4 w-8 bg-stone-700 rounded-sm"></div>
              <div className="h-4 w-8 bg-stone-700 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
