'use client';

import Image from 'next/image';

interface MenuItemProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  order: number;
  index: number;
  categoryIndex: number;
}

export function MenuItem({ 
  name, 
  description, 
  price, 
  imageUrl,
  index,
  categoryIndex 
}: MenuItemProps) {
  const animationDelay = (categoryIndex * 100) + (index * 50);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6 transition-all duration-500 hover:border-black/10 hover:shadow-xl hover:scale-[1.02] dark:border-white/5 dark:bg-black dark:hover:border-white/10 dark:hover:shadow-[0_8px_32px_rgba(255,255,255,0.08)] animate-slide-up opacity-0 animate-fade-in-up"
      style={{ 
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards'
      }}
    >
      <div className="flex items-start gap-6">
        {/* Image */}
        {imageUrl && (
          <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 group-hover:scale-105 transition-transform duration-300">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-xl font-semibold text-black dark:text-white transition-all duration-300 group-hover:text-black/90 dark:group-hover:text-white/90 group-hover:translate-x-1">
              {name}
            </h3>
            <div className="shrink-0">
              <div className="flex items-center gap-1 transition-transform duration-300 group-hover:scale-110">
                <span className="text-2xl font-bold text-black dark:text-white transition-colors duration-200">
                  {price.toFixed(0)}
                </span>
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors duration-200">
                  ₺
                </span>
              </div>
            </div>
          </div>
          
          {description && (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 transition-colors duration-300 max-w-2xl group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/0 to-black/5 dark:via-white/0 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
}

