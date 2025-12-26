import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingBag, MessageCircle, Gamepad2, User, Map as MapIcon, ZoomIn, Menu, X, ShoppingCart } from 'lucide-react';
import VirtualJoystick from './components/VirtualJoystick';
import ShopModal from './components/ShopModal';
import Character from './components/Character';
import { MOCK_SHOPS, GAME_WIDTH, GAME_HEIGHT, PLAYER_SIZE, PLAYER_SPEED, INITIAL_GOLD, FLOOR_IMAGE_URL, CHARACTER_SPRITES } from './constants';
import { InteractableObject, ShopItem, Position, Direction } from './types';

// Utility to calculate distance
const getDistance = (p1: Position, p2: Position) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const App: React.FC = () => {
  // Landing State
  const [gameStarted, setGameStarted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Game State
  const [playerPosition, setPlayerPosition] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const [interactable, setInteractable] = useState<InteractableObject | null>(null);
  const [activeShop, setActiveShop] = useState<InteractableObject | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<string[] | null>(null);
  const [viewMode, setViewMode] = useState<'action' | 'map'>('action');
  
  // Player Stats
  const [inventory, setInventory] = useState<ShopItem[]>([]);
  const [gold, setGold] = useState(INITIAL_GOLD);

  // Animation State
  const [facing, setFacing] = useState<Direction>('down');
  const [isMoving, setIsMoving] = useState(false);

  // Refs for loop
  const joystickRef = useRef({ x: 0, y: 0 });
  const playerRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const lastFacingRef = useRef<Direction>('down'); // To avoid state spam
  const requestRef = useRef<number>(0);

  // Camera/Transform State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  // Update Game Loop
  const update = useCallback(() => {
    const { x: dx, y: dy } = joystickRef.current;
    const moving = dx !== 0 || dy !== 0;
    
    // Update Animation State
    if (moving) {
        let newFacing = lastFacingRef.current;
        if (Math.abs(dx) > Math.abs(dy)) {
            newFacing = dx > 0 ? 'right' : 'left';
        } else {
            newFacing = dy > 0 ? 'down' : 'up';
        }

        if (newFacing !== lastFacingRef.current) {
            lastFacingRef.current = newFacing;
            setFacing(newFacing);
        }
    }
    
    // Only update isMoving state if it actually changed to prevent re-renders
    setIsMoving(prev => prev !== moving ? moving : prev);

    // Movement Logic
    if (moving) {
      const oldX = playerRef.current.x;
      const oldY = playerRef.current.y;
      
      let newX = oldX + dx * PLAYER_SPEED;
      let newY = oldY + dy * PLAYER_SPEED;

      // Boundaries
      newX = Math.max(0, Math.min(GAME_WIDTH, newX));
      newY = Math.max(0, Math.min(GAME_HEIGHT, newY));

      // Simple collision against shops (treat them as solid boxes)
      let collides = false;
      for (const shop of MOCK_SHOPS) {
        // Simple AABB collision
        if (
          newX < shop.position.x + shop.size.width + PLAYER_SIZE / 2 &&
          newX > shop.position.x - PLAYER_SIZE / 2 &&
          newY < shop.position.y + shop.size.height + PLAYER_SIZE / 2 &&
          newY > shop.position.y - PLAYER_SIZE / 2
        ) {
          collides = true;
          break;
        }
      }

      if (!collides) {
        playerRef.current = { x: newX, y: newY };
      }
    }

    // Check interactions
    let foundInteractable: InteractableObject | null = null;
    for (const shop of MOCK_SHOPS) {
        // Interaction center point
        const shopCenter = { 
            x: shop.position.x + shop.size.width / 2, 
            y: shop.position.y + shop.size.height / 2 
        };
        // Distance check (radius + some buffer)
        if (getDistance(playerRef.current, shopCenter) < 150) {
            foundInteractable = shop;
            break;
        }
    }

    setInteractable(foundInteractable);
    setPlayerPosition({ ...playerRef.current }); // Sync React state for rendering
    
    // Update transform based on view mode
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    if (viewMode === 'map') {
        // Scale to fit
        const scaleX = viewportW / GAME_WIDTH;
        const scaleY = viewportH / GAME_HEIGHT;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 90% fit to leave some margin
        
        // Center the board on screen
        const tx = (viewportW - GAME_WIDTH * scale) / 2;
        const ty = (viewportH - GAME_HEIGHT * scale) / 2;
        
        setTransform({ x: tx, y: ty, scale });
    } else {
        // Action mode: Scale 1, Center player
        const scale = 1;
        const tx = viewportW / 2 - playerRef.current.x * scale;
        const ty = viewportH / 2 - playerRef.current.y * scale;
        setTransform({ x: tx, y: ty, scale });
    }

    requestRef.current = requestAnimationFrame(update);
  }, [viewMode]); // Re-create loop if viewMode changes

  // Keyboard controls for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp': joystickRef.current.y = -1; break;
        case 'ArrowDown': joystickRef.current.y = 1; break;
        case 'ArrowLeft': joystickRef.current.x = -1; break;
        case 'ArrowRight': joystickRef.current.x = 1; break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) joystickRef.current.y = 0;
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) joystickRef.current.x = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    requestRef.current = requestAnimationFrame(update);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  const handleInteract = () => {
    if (!interactable) return;
    
    if (interactable.type === 'shop') {
      setActiveShop(interactable);
    } else if (interactable.type === 'sign' && interactable.dialogue) {
      setActiveDialogue(interactable.dialogue);
      setTimeout(() => setActiveDialogue(null), 3000);
    }
  };

  const handleBuy = (item: ShopItem) => {
    setGold(prev => prev - item.price);
    setInventory(prev => [...prev, item]);
    // Optional: Show success toast
  };

  const toggleView = () => {
    setViewMode(prev => prev === 'action' ? 'map' : 'action');
  };

  // Landing Page
  if (!gameStarted) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 font-sans overflow-y-scroll">

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Left side: Menu + Logo */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="text-white" size={28} />
              </button>

              {/* Logo/Brand */}
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-white" size={28} />
                <h1 className="text-2xl font-bold text-white tracking-tight">Mint & Marquee</h1>
              </div>
            </div>

            {/* Right side: Cart */}
            <div className="flex items-center gap-4">
              {/* Cart */}
              <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ShoppingCart className="text-white" size={24} />
                {inventory.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {inventory.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Side Panel */}
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="text-gray-900" size={24} />
            </button>
          </div>

          {/* Categories List */}
          <div className="p-6 space-y-2 overflow-y-auto h-[calc(100%-88px)]">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ShoppingBag className="text-white" size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-purple-600">All Shops</div>
                <div className="text-sm text-gray-500">Browse everything</div>
              </div>
            </button>

            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Gamepad2 className="text-white" size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-blue-600">Gaming</div>
                <div className="text-sm text-gray-500">Pixel perfect finds</div>
              </div>
            </button>

            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-green-600">Fashion</div>
                <div className="text-sm text-gray-500">Style & accessories</div>
              </div>
            </button>

            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-pink-50 transition-colors flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <MessageCircle className="text-white" size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-pink-600">Collectibles</div>
                <div className="text-sm text-gray-500">Rare items</div>
              </div>
            </button>

            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <MapIcon className="text-white" size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-orange-600">Explore</div>
                <div className="text-sm text-gray-500">Discover new areas</div>
              </div>
            </button>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setGameStarted(true);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                Start Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Overlay when menu is open */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Hero Section */}
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
          <div className="text-center z-10 px-6">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tight">
              Pixel Bazaar
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-8 font-medium">
              A world of shops awaits your discovery
            </p>
            <button
              onClick={() => setGameStarted(true)}
              className="bg-white text-purple-900 px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:scale-110 hover:shadow-purple-500/50 transition-all duration-300 active:scale-95 flex items-center gap-3 mx-auto"
            >
              <ShoppingBag size={28} />
              Explore Now
            </button>

            {/* Scroll indicator */}
            <div className="mt-16 animate-bounce">
              <div className="text-white/60 text-sm mb-2">Scroll to learn more</div>
              <svg className="w-6 h-6 mx-auto text-white/60" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>

          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-500 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 px-6 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
              Why You'll Love It
            </h2>
            <p className="text-blue-200 text-center mb-16 text-lg">
              Experience shopping like never before in this immersive pixel world
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Gamepad2 size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center">Explore Freely</h3>
                <p className="text-blue-200 text-center">
                  Navigate a vibrant pixel world using intuitive controls. Discover hidden shops and unique items around every corner.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <ShoppingBag size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center">Shop & Collect</h3>
                <p className="text-blue-200 text-center">
                  Visit unique pixel shops, browse their inventory, and build your collection. Each shop offers something special.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MapIcon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center">Map Overview</h3>
                <p className="text-blue-200 text-center">
                  Switch between action and map views to plan your route or zoom in for an up-close shopping experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
              How It Works
            </h2>
            <p className="text-blue-200 text-center mb-16 text-lg">
              Get started in three simple steps
            </p>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  1
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Move Your Character</h3>
                  <p className="text-blue-200 text-lg">
                    Use arrow keys on desktop or the virtual joystick on mobile to navigate the pixel world. Your character responds instantly to your commands.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  2
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Find Shops</h3>
                  <p className="text-blue-200 text-lg">
                    Explore the world to find colorful shops. When you get close, an interaction ring appears and you can enter to browse their inventory.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  3
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Shop & Build Your Collection</h3>
                  <p className="text-blue-200 text-lg">
                    Browse unique items, make purchases with your gold, and watch your inventory grow. Each item you collect adds to your personal collection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery/Preview Section */}
        <section className="relative py-20 px-6 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
              Experience the World
            </h2>
            <p className="text-blue-200 text-center mb-16 text-lg">
              A pixel perfect shopping adventure
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 backdrop-blur-md rounded-2xl p-12 border border-white/20 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle size={64} className="text-white/60 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white">Interactive NPCs</h3>
                  <p className="text-blue-200 mt-2">Chat with characters and discover their stories</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-600/30 to-purple-600/30 backdrop-blur-md rounded-2xl p-12 border border-white/20 flex items-center justify-center">
                <div className="text-center">
                  <User size={64} className="text-white/60 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white">Your Avatar</h3>
                  <p className="text-blue-200 mt-2">Control your character with smooth animations</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl md:text-2xl text-blue-200 mb-10 font-medium">
              Jump into the pixel bazaar and start your adventure today
            </p>
            <button
              onClick={() => setGameStarted(true)}
              className="bg-white text-purple-900 px-12 py-5 rounded-full text-2xl font-bold shadow-2xl hover:scale-110 hover:shadow-purple-500/50 transition-all duration-300 active:scale-95 flex items-center gap-4 mx-auto"
            >
              <ShoppingBag size={32} />
              Start Exploring
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          </div>
        </section>

      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden font-sans">
      
      {/* Game World Layer */}
      <div 
        className="absolute top-0 left-0 will-change-transform"
        style={{ 
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            transformOrigin: '0 0',
            width: GAME_WIDTH,
            height: GAME_HEIGHT
        }}
      >
        {/* Floor Pattern: Full Map Image */}
        <img 
          src={FLOOR_IMAGE_URL}
          alt="Game World Map"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
          draggable={false}
        />
        
        {/* World Boundary */}
        <div className="absolute inset-0 border-4 border-red-500/50 rounded-xl pointer-events-none" />

        {/* Shops / Objects */}
        {MOCK_SHOPS.map(shop => (
          <div
            key={shop.id}
            className={`absolute rounded-lg shadow-xl flex flex-col items-center justify-center text-white font-bold transition-transform ${shop.color}`}
            style={{
              left: shop.position.x,
              top: shop.position.y,
              width: shop.size.width,
              height: shop.size.height,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="absolute -top-10 bg-black/50 px-3 py-1 rounded-full whitespace-nowrap text-sm backdrop-blur-sm border border-white/10"
                 style={{ transform: `scale(${1/transform.scale})`, transformOrigin: 'bottom center' }}
            >
              {shop.label}
            </div>
            {shop.type === 'shop' && <ShoppingBag className="mb-1 opacity-80" />}
            {shop.type === 'sign' && <MessageCircle className="mb-1 opacity-80" />}
            
            {/* Interaction Ring */}
            {interactable?.id === shop.id && (
                <div className="absolute -inset-4 border-2 border-white/50 rounded-xl animate-pulse" />
            )}
          </div>
        ))}

        {/* Player */}
        <div
          className="absolute z-10 flex flex-col items-center justify-center transition-transform duration-75"
          style={{
            left: playerPosition.x - PLAYER_SIZE / 2,
            top: playerPosition.y - PLAYER_SIZE / 2,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
          }}
        >
          {/* Character Component Replaces the Blue Circle */}
          <Character 
            direction={facing} 
            isMoving={isMoving} 
            sprites={CHARACTER_SPRITES}
          />
          
          <div className="absolute -bottom-6 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-bold"
               style={{ display: viewMode === 'map' ? 'none' : 'block' }}>You</div>
        </div>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-4 text-white">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={20} />
                </div>
                <div>
                    <div className="text-xs text-gray-400 uppercase font-bold">Balance</div>
                    <div className="flex items-center gap-1 text-yellow-400 font-mono font-bold">
                        <Coins size={14} />
                        {gold}
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-4">
                <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white">
                    <div className="text-xs text-gray-400 uppercase font-bold text-right mb-1">Inventory</div>
                    <div className="flex gap-1 justify-end">
                        {inventory.length === 0 && <span className="text-xs text-gray-500 italic">Empty bag...</span>}
                        {inventory.slice(-3).map((item, i) => (
                            <div key={i} className="w-8 h-8 rounded bg-gray-700 border border-gray-600 overflow-hidden relative" title={item.name}>
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
                        {inventory.length > 3 && (
                            <div className="w-8 h-8 rounded bg-gray-800 border border-gray-600 flex items-center justify-center text-xs font-bold">
                                +{inventory.length - 3}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* View Toggle Button */}
                <button 
                    onClick={toggleView}
                    className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-white/20 transition-colors shadow-lg active:scale-95"
                    title={viewMode === 'action' ? "Zoom Out to Map" : "Zoom In to Player"}
                >
                    {viewMode === 'action' ? <MapIcon size={24} /> : <ZoomIn size={24} />}
                </button>
            </div>
        </div>

        {/* Interaction Prompt (Hidden in Map Mode) */}
        {interactable && !activeShop && !activeDialogue && viewMode === 'action' && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120px] pointer-events-auto animate-bounce">
              <button 
                onClick={handleInteract}
                className="bg-white text-black px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
              >
                 {interactable.type === 'shop' ? <ShoppingBag size={18} /> : <MessageCircle size={18} />}
                 Interact
              </button>
           </div>
        )}

        {/* Dialogue Bubble (Hidden in Map Mode) */}
        {activeDialogue && viewMode === 'action' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-24 bg-white text-black px-6 py-4 rounded-2xl shadow-xl max-w-xs text-center animate-in zoom-in duration-200">
                <p className="font-medium">{activeDialogue[0]}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white rotate-45" />
            </div>
        )}

        {/* Bottom Controls */}
        <div className="pointer-events-auto h-32 relative">
             {/* Joystick handled by its own fixed position */}
             <div className="absolute bottom-0 right-0 text-white/20 text-xs flex flex-col items-end">
                <div className="flex items-center gap-1"><Gamepad2 size={12}/> Use Arrows or Joystick to move</div>
             </div>
        </div>
      </div>

      {/* Components requiring pointer events */}
      <VirtualJoystick 
        onMove={(x, y) => {
           joystickRef.current = { x, y };
        }} 
      />

      {/* Shop Modal */}
      {activeShop && activeShop.type === 'shop' && activeShop.items && (
        <ShopModal
          items={activeShop.items}
          shopName={activeShop.label}
          playerGold={gold}
          onClose={() => setActiveShop(null)}
          onBuy={handleBuy}
        />
      )}

    </div>
  );
};

// Simple Coin icon component since lucide Coin might vary
const Coins = ({ size, className }: { size: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
        <path d="M7 6h1v4" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    </svg>
);

export default App;