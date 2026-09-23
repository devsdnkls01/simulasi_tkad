import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  schoolName?: string;
  subtitle?: string;
}

export default function Logo({
  size = 40,
  className = '',
  showText = true,
  schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'SD NEGERI KALISALAK 01',
  subtitle = 'SIMULASI TKA/TKAD',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo-tegal.svg"
          alt="Lambang Kabupaten Tegal"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="leading-tight flex flex-col justify-center">
          <p className="text-[10px] sm:text-xs font-black text-blue-700 uppercase tracking-wider">
            {subtitle}
          </p>
          <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight line-clamp-1">
            {schoolName}
          </h2>
        </div>
      )}
    </div>
  );
}
