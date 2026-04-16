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
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#b48a3c] font-bold">Jewellers</span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed max-w-xs font-light">
              Crafting timeless elegance since generations. Our temple jewellery is a tribute to divine craftsmanship and Indian heritage.
            </p>
            <div className="flex gap-4">
              {['FB', 'IG', 'TW', 'YT'].map(social => (
                <div key={social} className="w-8 h-8 rounded-full border border-stone-800 flex items-center justify-center text-[10px] text-stone-500 hover:border-[#b48a3c] hover:text-[#b48a3c] transition-all cursor-pointer">
                  {social}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-white">The Boutique</h4>
            <div className="space-y-4 text-stone-500 text-sm font-light">
              <p className="flex items-start gap-3 italic">
                <span className="text-[#b48a3c]">Address:</span> Chennai, Tamil Nadu, India
              </p>
              <p className="flex items-center gap-3 italic">
                <span className="text-[#b48a3c]">Phone:</span> +91 98765 43210
              </p>
              <p className="flex items-center gap-3 italic">
                <span className="text-[#b48a3c]">Email:</span> concierge@sagunthala.com
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-white">Collections</h4>
            <ul className="space-y-3">
              {['Temple Jewellery', 'Bridal Sets', 'Gold Coins', 'Diamond Vault'].map(link => (
                <li key={link}>
                  <Link href="#" className="text-stone-500 text-sm font-light hover:text-[#b48a3c] transition-colors">{link}</Link>
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
                  <Link href="#" className="text-stone-500 text-sm font-light hover:text-[#b48a3c] transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600 font-medium">
            © {new Date().getFullYear()} Sagunthala Jewellers. Handcrafted in India.
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