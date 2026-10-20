import React from 'react';
import { ShieldCheck, Flame, Heart } from 'lucide-react';

export default function Footer({ shopName, whatsappNumber }) {
  return (
    <footer className="bg-white border-t border-surface-border mt-auto pt-8 pb-12 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-surface-text">
              <Flame className="w-5 h-5 text-primary-500" />
              <span>{shopName || "Crackzo"}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Safe & licensed green fireworks directly from authentic manufacturers. Celebrate every festival with joy and color.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety Guidelines</span>
            </div>
            <ul className="text-xs space-y-1 text-gray-500">
              <li>• Always burst crackers in open outdoor spaces</li>
              <li>• Keep a bucket of water and sand ready</li>
              <li>• Light with sparklers or agarbatti at arm's length</li>
              <li>• Never relight crackers that failed to ignite</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-gray-800 mb-2">WhatsApp Direct Ordering</div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              Add your favorite crackers to the cart and instantly send your prefilled order to the shop owner on WhatsApp.
            </p>
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Chat on WhatsApp: +{whatsappNumber}
              </a>
            )}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {shopName || "Crackzo"}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for festive celebrations with <Heart className="w-3.5 h-3.5 text-primary-500 fill-primary-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
