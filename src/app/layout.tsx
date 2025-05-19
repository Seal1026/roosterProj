import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import InitializeApp from "@/components/InitializeApp";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rooster - Scheduled AI Prompts",
  description: "Schedule your AI prompts and get responses delivered to your inbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Component to initialize the app */}
        <InitializeApp />
        
        <header className="bg-blue-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">Rooster</Link>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/" className="hover:underline">Home</Link>
                </li>
                <li>
                  <Link href="/prompts" className="hover:underline">Prompts</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}