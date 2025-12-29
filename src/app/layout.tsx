import type { Metadata } from 'next';
import './globals.css';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';

export const metadata: Metadata = {
  title: 'Word Glitch - Find Words in the Chaos',
  description: 'A mobile word finding game with glitch effects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Apple iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Word Glitch" />
        {/* Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        <MusicPlayerProvider>
          {children}
        </MusicPlayerProvider>
      </body>
    </html>
  );
}

