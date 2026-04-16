import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AutoPlayAudio from "../components/ui/AutoPlayAudio";

export const metadata = {
  metadataBase: new URL("https://sagunthala-jewelers.vercel.app/"),

  title: {
    default: "Sagunthala Jewellers | Premium Gold & Temple Jewellery",
    template: "%s | Sagunthala Jewellers",
  },

  description:
    "Discover divine temple jewellery, premium gold, and diamond collections at Sagunthala Jewellers. Handcrafted heritage pieces for the modern woman.",

  keywords: [
    "Sagunthala Jewellers",
    "Temple Jewellery Chennai",
    "Premium Gold Jewellery",
    "Diamond Jewellery",
    "1 Gram Gold Polish",
    "Mylapore Jewellery Shop",
    "Luxury Indian Jewellery"
  ],

  openGraph: {
    title: "Sagunthala Jewellers",
    description: "Premium gold and temple jewellery collections crafted with divine heritage.",
    url: "https://sagunthalajewelers.vercel.app",
    siteName: "Sagunthala Jewellers",
    images: [
      {
        url: "/og-image.jpg", // Recommended to use a lifestyle shot for OG
        width: 1200,
        height: 630,
        alt: "Sagunthala Jewellers Heritage Collection",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Sagunthala Jewellers",
    description: "Premium gold and temple jewellery collections.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className="bg-slate-50 text-slate-900 antialiased transition-colors selection:bg-amber-300/40 selection:text-amber-900 dark:bg-[#0f1115] dark:text-slate-100 dark:selection:bg-amber-700/40 dark:selection:text-amber-200"
        suppressHydrationWarning
      >
        

        {/* Subtle Global Grain Texture Overlay */}
        <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.01] dark:opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        
        {/* Decorative Top Glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-[1000px] rounded-full bg-amber-300/20 blur-[120px] pointer-events-none z-0 dark:bg-[#b48a3c]/5"></div>

        <Header />
        <AutoPlayAudio />
        <main className="relative z-10 min-h-screen admin-content-shift transition-[margin] duration-200">
          {children}
        </main>

        <div className="admin-content-shift transition-[margin] duration-200">
          <Footer />
        </div>

      
      </body>
    </html>
  );
}