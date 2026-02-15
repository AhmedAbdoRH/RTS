import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

// CartItem interface is defined in CartContext

// Animation variants
const overlayVariants = {
  hidden: { 
    opacity: 0,
  },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: 'easeInOut'
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.2,
      ease: 'easeInOut'
    }
  }
};

const cartVariants = {
  hidden: { 
    x: '100%',
    opacity: 0.5
  },
  visible: { 
    x: 0,
    opacity: 1,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 300,
      mass: 0.5
    }
  },
  exit: { 
    x: '100%',
    opacity: 0.5,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 300,
      mass: 0.5
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.98
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut'
    }
  }),
  exit: () => ({  // Removed unused 'i' parameter
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  })
};

const Cart: React.FC = () => {
  const { 
    cartItems, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity,
    cartTotal 
  } = useCart();
  
  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay with fade animation */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={() => toggleCart(false)}
          />
          
          {/* Cart panel with slide animation */}
          <motion.div
            className="absolute inset-y-0 right-0 w-full max-w-md bg-[#1c594e] shadow-xl flex flex-col border-l border-[#ffd453]/20"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cartVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#ffd453]/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#ffd453]">Shopping Cart</h2>
              <button
                onClick={() => toggleCart(false)}
                className="text-white/70 hover:text-[#ffd453]"
                aria-label="Close Cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <ShoppingCart className="w-16 h-16 text-[#ffd453]/20 mb-4" />
                  <h3 className="text-lg font-medium text-[#ffd453]/60">Your cart is empty</h3>
                  <p className="mt-1 text-white/40">Start by adding some products</p>
                </div>
              ) : (
                <motion.ul className="space-y-4">
                  {cartItems.map((item, index) => (
                    <motion.li
                      key={item.id}
                      className="flex items-center p-3 border border-[#ffd453]/10 rounded-md bg-white/5"
                      variants={itemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      {item.imageUrl && (
                        <div className="w-20 h-20 flex-shrink-0 rounded-sm overflow-hidden border border-[#ffd453]/10">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="mr-3 flex-1 text-right">
                        <h3 className="font-medium text-white">{item.title}</h3>
                        <p className="text-[#ffd453]">{item.price} ج</p>
                        <div className="flex items-center mt-2 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeFromCart(item.id);
                              }
                            }}
                            className="p-1 text-white/70 hover:bg-white/10 rounded"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="mx-2 w-6 text-center text-white">{item.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, item.quantity + 1);
                            }}
                            className="p-1 text-white/70 hover:bg-white/10 rounded"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.id);
                        }}
                        className="text-red-400 hover:text-red-500 p-2"
                        aria-label="Remove product"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>

            {/* Footer with total and checkout button */}
            {cartItems.length > 0 && (
              <div className="border-t border-[#ffd453]/20 p-4">
                <div className="flex justify-between text-lg font-medium mb-4 text-[#ffd453]">
                  <span>Total</span>
                  <span>{cartTotal} ج</span>
                </div>
                <button
                  onClick={() => {
                    // Handle checkout
                    const message = cartItems
                      .map(item => `${item.title} - ${item.quantity} × ${item.price} ج`)
                      .join('\n');
                    window.open(
                      `https://wa.me/201557777587?text=${encodeURIComponent(
                        `طلب جديد:\n${message}\n\nالإجمالي: ${cartTotal} ج`
                      )}`,
                      '_blank'
                    );
                    // Close cart after checkout
                    toggleCart(false);
                  }}
                  className="w-full bg-[#ffd453] text-[#1c594e] py-3 rounded-md font-bold hover:brightness-110 transition-all shadow-lg active:scale-95"
                >
                  إتمام الطلب
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Cart;
