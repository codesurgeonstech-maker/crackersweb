import React from 'react';
import { Sparkles, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';
import DiwaliDiya from './DiwaliDiya';
import { triggerDiwaliConfetti } from '../../utils/confetti';

export default function DiwaliHeroBanner({ shop }) {
  const handleCelebrate = () => {
    triggerDiwaliConfetti();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-900 via-rose-900 to-amber-900 text-white p-5 sm:p-7 shadow-card border border-amber-500/30">
      {/* Decorative Gold Rangoli Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#FDE047_1.5px,transparent_1.5px)] [background-size:20px_20px]"
      />

      {/* Ambient Warm Golden Glow Orbs */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Side: Festival Greeting & Shop Info */}
        <div className="space-y-3 max-w-2xl">
          {/* Festive Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold backdrop-blur-sm shadow-xs">
            <DiwaliDiya size="xs" glow={false} />
            <span className="tracking-wide uppercase text-[10px] sm:text-xs">
              Diwali Festival Special Collection 🪔
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
            Celebrate the <span className="text-amber-300">Festival of Lights</span> with Dazzling Joy!
          </h2>

          {/* Description / Shop Welcome Message */}
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-normal">
            {shop?.welcomeMessage ||
              "Explore premium verified festive crackers, sparklers, ground chakkars, aerial shells, and gift boxes. Add your favorites to cart and order directly on WhatsApp!"}
          </p>

          {/* Feature Highlights */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 border border-amber-400/20 text-[11px] font-medium text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-sparkle-twinkle" />
              <span>Dazzling Effects</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 border border-amber-400/20 text-[11px] font-medium text-amber-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quality Tested</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 border border-amber-400/20 text-[11px] font-medium text-amber-200">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>Fast WhatsApp Packing</span>
            </div>
          </div>
        </div>

        {/* Right Side: Animated Diyas Showcase + Celebrate Confetti Trigger */}
        <div className="flex flex-row md:flex-col items-center justify-between w-full md:w-auto gap-4 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
          <div className="flex items-center gap-3">
            <DiwaliDiya size="md" withSparkles={true} />
            <div className="text-left md:text-center">
              <p className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Shubh Deepavali
              </p>
              <p className="text-[11px] text-white/80">
                Light up family moments
              </p>
            </div>
            <DiwaliDiya size="md" withSparkles={true} />
          </div>

          <button
            onClick={handleCelebrate}
            type="button"
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:shadow-amber-400/30"
            title="Click to celebrate with fireworks confetti!"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-900 fill-amber-900" />
            <span>Celebrate Diwali ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
}
