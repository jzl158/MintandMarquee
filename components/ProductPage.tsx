import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Product } from '../types';

interface ProductPageProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ product, onClose, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-emerald-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="font-semibold">Back</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10">
              <img
                src={product.images[currentImageIndex]}
                alt={product.displayName}
                className="w-full h-full object-contain p-8"
              />

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm p-3 rounded-full hover:bg-black/80 transition-colors border border-white/20"
                  >
                    <ChevronLeft className="text-white" size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm p-3 rounded-full hover:bg-black/80 transition-colors border border-white/20"
                  >
                    <ChevronRight className="text-white" size={24} />
                  </button>

                  {/* Image Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-emerald-500 w-8'
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-white/5 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-emerald-500 scale-105'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.displayName} view ${index + 1}`}
                      className="w-full h-full object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="inline-block">
              <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold border border-emerald-500/30">
                {product.subCategory}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {product.displayName}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-emerald-400">
                ${product.price.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Description</h2>
              <p className="text-emerald-100 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Features</h2>
              <ul className="space-y-2 text-emerald-100">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>High-quality 3D printed design</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Durable and long-lasting materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Handcrafted with attention to detail</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span>Unique design exclusive to Mint & Marquee</span>
                </li>
              </ul>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-6 space-y-4">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  isAddedToCart
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gradient-to-r from-emerald-600 to-green-700 hover:shadow-xl hover:scale-105'
                } text-white`}
              >
                <ShoppingCart size={24} />
                {isAddedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </button>

              <p className="text-center text-emerald-200 text-sm">
                Free shipping on orders over $50
              </p>
            </div>

            {/* Additional Info */}
            <div className="border-t border-white/10 pt-6 space-y-3 text-sm">
              <div className="flex justify-between text-emerald-100">
                <span>Product ID:</span>
                <span className="font-mono">{product.id}</span>
              </div>
              <div className="flex justify-between text-emerald-100">
                <span>Category:</span>
                <span>{product.subCategory}</span>
              </div>
              <div className="flex justify-between text-emerald-100">
                <span>Availability:</span>
                <span className="text-green-400">In Stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
