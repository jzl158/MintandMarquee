import React, { useState, useMemo } from 'react';
import { ShoppingCart, Coins, X, ShieldCheck, CreditCard, ChevronRight, TrendingUp } from 'lucide-react';
import { Product } from '../types';

interface ShopModalProps {
  products: Product[];
  shopName: string;
  playerPoints: number;
  onClose: () => void;
  onBuy: (product: Product) => void;
  isGameMode?: boolean;
}

const ShopModal: React.FC<ShopModalProps> = ({ products, shopName, playerPoints, onClose, onBuy, isGameMode = false }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = () => {
    if (!selectedProduct) return;

    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      onBuy(selectedProduct);
      setIsProcessing(false);
      setSelectedProduct(null); // Close detail view after buy
    }, 1000);
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
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full border border-emerald-500/30">
              {isGameMode ? <TrendingUp className="text-emerald-400" size={20} /> : <Coins className="text-yellow-400" size={20} />}
              <span className={`font-mono font-bold text-lg ${isGameMode ? 'text-emerald-400' : 'text-yellow-400'}`}>{playerPoints}</span>
              {isGameMode && <span className="text-gray-400 text-sm ml-1">pts</span>}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">

          {/* Main List & Detail Split */}
          <div className="flex-1 flex overflow-hidden relative">

            {/* Products Grid */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-6 ${selectedProduct ? 'hidden lg:block' : 'block'}`}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`group relative flex flex-col bg-white border-2 rounded-2xl p-4 transition-all hover:shadow-lg text-left ${
                      selectedProduct?.id === product.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl'
                        : 'border-gray-100 hover:border-emerald-300'
                    }`}
                  >
                    <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                        <img src={product.mainImage} alt={product.displayName} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                        {isGameMode && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                            +{product.price} <TrendingUp size={12} />
                          </div>
                        )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{product.displayName}</h3>
                    <div className={`flex items-center gap-1 font-bold mt-auto ${isGameMode ? 'text-emerald-600' : 'text-yellow-600'}`}>
                      {isGameMode ? <TrendingUp size={14} /> : <Coins size={14} />}
                      {isGameMode ? `+${product.price}` : product.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail View (Overlay on mobile/tablet, Side panel on desktop) */}
            {selectedProduct && (
               <div className="absolute inset-0 lg:static lg:w-[400px] bg-white border-l border-gray-200 flex flex-col z-20 animate-in slide-in-from-right duration-300">
                 <div className="p-6 flex-1 overflow-y-auto">
                    <button
                        onClick={() => setSelectedProduct(null)}
                        className="lg:hidden mb-4 flex items-center text-gray-500 hover:text-gray-900"
                    >
                        <ChevronRight className="rotate-180" size={20}/> Back to products
                    </button>

                    <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-6 shadow-inner">
                        <img src={selectedProduct.mainImage} alt={selectedProduct.displayName} className="w-full h-full object-contain p-4" />
                    </div>

                    <div className="flex justify-between items-start mb-4">
                        <div>
                             <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-2 tracking-wide uppercase ${
                               isGameMode ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                             }`}>
                                {selectedProduct.subCategory}
                            </span>
                            <h2 className="text-3xl font-bold text-gray-900">{selectedProduct.displayName}</h2>
                        </div>
                         <div className={`text-2xl font-bold flex items-center gap-1 ${isGameMode ? 'text-emerald-600' : 'text-yellow-600'}`}>
                             {isGameMode ? <TrendingUp size={24} /> : <Coins size={24} className="fill-current" />}
                             {isGameMode ? `+${selectedProduct.price}` : selectedProduct.price}
                         </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                        {selectedProduct.description}
                    </p>

                    {!isGameMode && (
                      <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                              <ShieldCheck className="text-green-500" size={20} />
                              <span>Secure transaction encrypted by Stripe</span>
                          </div>
                      </div>
                    )}
                 </div>

                 {/* Action Bar */}
                 <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handlePurchase}
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                            isProcessing
                                ? `${isGameMode ? 'bg-emerald-600' : 'bg-blue-600'} text-white cursor-wait`
                                : `${isGameMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-black hover:bg-gray-800'} text-white hover:scale-[1.02] active:scale-[0.98]`
                        }`}
                    >
                        {isProcessing ? (
                            <>Processing...</>
                        ) : isGameMode ? (
                            <>
                                <TrendingUp size={20} />
                                Collect +{selectedProduct.price} Points
                            </>
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
            {!selectedProduct && (
                 <div className="hidden lg:flex w-[400px] border-l border-gray-200 bg-gray-50 items-center justify-center text-gray-400 flex-col gap-4">
                    <ShoppingCart size={48} className="opacity-20" />
                    <p>Select a product to view details</p>
                 </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShopModal;