'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface QRCodeProps {
  value: string;
  size?: number;
}

// Dynamic import to avoid SSR issues
const QRCodeComponent = dynamic(
  () => import('react-qr-code'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
    )
  }
) as any;

export function QRCode({ value, size = 200 }: QRCodeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className="rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 p-4"
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white dark:bg-white p-4 border border-black/10 dark:border-white/10 shadow-lg">
      <QRCodeComponent
        value={value}
        size={size}
        level="H"
        fgColor="#000000"
        bgColor="#ffffff"
        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
      />
    </div>
  );
}

