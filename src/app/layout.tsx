import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'タスククエスト - 毎日のタスクで育てるタスクRPG',
  description: '日々のタスク（ToDo）を消化してキャラクターを強化し、モンスターを討伐するタスク育成RPGアプリ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
