import React, { useState, useMemo } from 'react';
import { ShoppingCart, Coins, X, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import { ShopItem, ItemCategory } from '../types';

interface ShopModalProps {
  items: ShopItem[];
  shopName: string;
  playerGold: number;
  onClose: () => void;
  onBuy: (item: ShopItem) => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ items, shopName, playerGold, onClose, onBuy }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract unique categories from available items
  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category));
    return ['All', ...Array.from(cats)];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter(i => i.category === selectedCategory);
  }, [items, selectedCategory]);

  const handlePurchase = () => {
    if (!selectedItem) return;
    if (playerGold < selectedItem.price) {
      alert("Not enough gold!");
      return;
    }

    setIsProcessing(true);
    // Simulate Stripe processing delay
    setTimeout(() => {
      onBuy(selectedItem);
      setIsProcessing(false);
      setSelectedItem(null); // Close detail view after buy
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-gray-900 w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <ShoppingCart size={24} className="text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{shopName}</h2>
              <p className="text-gray-400 text-sm">Welcome, traveler.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full border border-yellow-500/30">
              <Coins className="text-yellow-400" size={20} />
              <span className="font-mono font-bold text-yellow-400 text-lg">{playerGold}</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar / Tabs */}
          <div className="w-48 bg-gray-50 border-r border-gray-200 overflow-y-auto hidden md:block">
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Tabs (Horizontal) */}
          <div className="md:hidden absolute top-[88px] left-0 right-0 bg-white border-b border-gray-100 z-10 overflow-x-auto">
            <div className="flex p-2 gap-2">
               {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main List & Detail Split */}
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* Items Grid */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-6 ${selectedItem ? 'hidden lg:block' : 'block'}`}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12 md:mt-0">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group relative flex flex-col bg-white border-2 rounded-2xl p-4 transition-all hover:shadow-lg text-left ${
                      selectedItem?.id === item.id 
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xl' 
                        : 'border-gray-100 hover:border-blue-300'
                    }`}
                  >
                    <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-full">
                            {item.category}
                        </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-600 font-bold mt-auto">
                      <Coins size={14} />
                      {item.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail View (Overlay on mobile/tablet, Side panel on desktop) */}
            {selectedItem && (
               <div className="absolute inset-0 lg:static lg:w-[400px] bg-white border-l border-gray-200 flex flex-col z-20 animate-in slide-in-from-right duration-300">
                 <div className="p-6 flex-1 overflow-y-auto">
                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="lg:hidden mb-4 flex items-center text-gray-500 hover:text-gray-900"
                    >
                        <ChevronRight className="rotate-180" size={20}/> Back to items
                    </button>

                    <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-6 shadow-inner">
                        <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex justify-between items-start mb-4">
                        <div>
                             <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-2 tracking-wide uppercase">
                                {selectedItem.category}
                            </span>
                            <h2 className="text-3xl font-bold text-gray-900">{selectedItem.name}</h2>
                        </div>
                         <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                             <Coins size={24} className="fill-current" />
                             {selectedItem.price}
                         </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                        {selectedItem.description}
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                            <ShieldCheck className="text-green-500" size={20} />
                            <span>Secure transaction encrypted by Stripe</span>
                        </div>
                    </div>
                 </div>

                 {/* Action Bar */}
                 <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handlePurchase}
                        disabled={isProcessing || playerGold < selectedItem.price}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                            playerGold < selectedItem.price
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isProcessing 
                                ? 'bg-blue-600 text-white cursor-wait'
                                : 'bg-black text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        {isProcessing ? (
                            <>Processing...</>
                        ) : playerGold < selectedItem.price ? (
                            <>Insufficient Funds</>
                        ) : (
                            <>
                                <CreditCard size={20} />
                                Pay with Stripe
                            </>
                        )}
                    </button>
                 </div>
               </div>
            )}
            
            {/* Empty State for Desktop Detail */}
            {!selectedItem && (
                 <div className="hidden lg:flex w-[400px] border-l border-gray-200 bg-gray-50 items-center justify-center text-gray-400 flex-col gap-4">
                    <ShoppingCart size={48} className="opacity-20" />
                    <p>Select an item to view details</p>
                 </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShopModal;