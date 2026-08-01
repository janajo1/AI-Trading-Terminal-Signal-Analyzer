import React, { useState } from 'react';
import { Asset, MarketCategory } from '../types';
import { Search, Sparkles, TrendingUp, TrendingDown, Filter } from 'lucide-react';

interface MarketWatchSidebarProps {
  assets: Asset[];
  selectedAsset: Asset;
  onSelectAsset: (asset: Asset) => void;
  onGenerateSignalForAsset: (asset: Asset) => void;
}

export const MarketWatchSidebar: React.FC<MarketWatchSidebarProps> = ({
  assets,
  selectedAsset,
  onSelectAsset,
  onGenerateSignalForAsset
}) => {
  const [activeCategory, setActiveCategory] = useState<MarketCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { key: MarketCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'الكل', icon: '🌐' },
    { key: 'forex', label: 'فوركس', icon: '💱' },
    { key: 'commodities', label: 'معادن ونفط', icon: '🥇' },
    { key: 'crypto', label: 'كريبتو', icon: '🪙' },
    { key: 'indices', label: 'مؤشرات', icon: '📊' },
    { key: 'stocks', label: 'أسهم', icon: '📈' }
  ];

  const filteredAssets = assets.filter(a => {
    const matchesCategory = activeCategory === 'all' || a.category === activeCategory;
    const matchesSearch = a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.nameAr.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <aside id="market-watch-sidebar" className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Search & Header */}
      <div className="p-3 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            مراقبة السوق (Market Watch)
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">{filteredAssets.length} زوج تداول</span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن رمز (ذهب، EURUSD، BTC)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Categories Tab Pill Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Symbol List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
        {filteredAssets.map((asset) => {
          const isSelected = selectedAsset.symbol === asset.symbol;
          const isPositive = asset.change24h >= 0;

          return (
            <div
              key={asset.symbol}
              onClick={() => onSelectAsset(asset)}
              className={`group p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-950/60 border-r-4 border-blue-500'
                  : 'hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl group-hover:scale-110 transition-transform">{asset.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-100 font-mono tracking-tight">{asset.symbol}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-950 px-1 rounded border border-slate-800 font-mono">
                      {asset.spread}p
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{asset.nameAr}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Price & Change Ticker */}
                <div className="text-left font-mono">
                  <div className="text-xs font-bold text-slate-200">
                    {asset.currentPrice.toFixed(asset.digits)}
                  </div>
                  <div className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isPositive ? '+' : ''}{asset.change24h}%</span>
                  </div>
                </div>

                {/* Instant Signal Trigger Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateSignalForAsset(asset);
                  }}
                  title="توصية AI فورا"
                  className="p-1.5 rounded-md bg-emerald-950 border border-emerald-800/80 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredAssets.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-400">
            لم يتم العثور على أزواج تداول تطابق البحث.
          </div>
        )}
      </div>
    </aside>
  );
};
