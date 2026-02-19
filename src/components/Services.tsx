import { useEffect, useState, useCallback } from 'react';
import ServiceCard from './ServiceCard';
import { supabase } from '../lib/supabase';
import type { Service, Category } from '../types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

export default function Services() {
  const { t, language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | 'featured' | 'best_sellers' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFeaturedProducts, setHasFeaturedProducts] = useState(false);
  const [hasBestSellerProducts, setHasBestSellerProducts] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all services with their categories
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories(*),
          product_sizes(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);

      // Check if we have any featured or best seller products
      const hasFeatured = data?.some(service => service.is_featured) || false;
      const hasBestSellers = data?.some(service => service.is_best_seller) || false;
      
      setHasFeaturedProducts(hasFeatured);
      setHasBestSellerProducts(hasBestSellers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredServices = useCallback((): Service[] => {
    if (!selectedCategory) return services;
    
    if (selectedCategory === 'featured') {
      return services.filter(service => service.is_featured === true);
    }
    
    if (selectedCategory === 'best_sellers') {
      return services.filter(service => service.is_best_seller === true);
    }
    
    return services.filter(service => service.category_id === selectedCategory);
  }, [selectedCategory, services]);

  const getMinPrice = (service: Service): string | undefined => {
    if (!service.has_multiple_sizes || !service.product_sizes || service.product_sizes.length === 0) {
      return undefined;
    }
    
    const prices = service.product_sizes.map(size => {
      const priceStr = size.sale_price || size.price;
      if (!priceStr) return Infinity;
      const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
      return isNaN(numericPrice) ? Infinity : numericPrice;
    });
    
    const min = Math.min(...prices);
    return min === Infinity ? undefined : min.toString();
  };

  if (isLoading) {
    return (
      <div className="py-16 bg-[#1c594e]">
        <div className="container mx-auto px-4 text-center text-[#ffd453]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#ffd453] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-bold">
              {language === 'ar' ? 'جاري تحميل المنتجات...' : 'Loading products...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-[#1c594e]">
        <div className="container mx-auto px-4 text-center text-red-600">
          {language === 'ar' ? `حدث خطأ أثناء تحميل المنتجات: ${error}` : `An error occurred while loading products: ${error}`}
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-[#1c594e]" id="products">
      <motion.div
        className="container mx-auto px-4 bg-white/5 backdrop-blur-xl rounded-lg p-8 border border-white/10 shadow-2xl shadow-black/40"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.8, delayChildren: 0.3, staggerChildren: 0.2 } },
        }}
      >
        {/* Title */}
        <motion.div 
          className="text-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <button className="button text-2xl sm:text-6xl lg:text-7xl font-bold">
            {t('products.title')}
            <div className="hoverEffect">
              <div></div>
            </div>
          </button>
        </motion.div>

        {/* Special Categories */}
        <motion.div
          className="flex flex-wrap gap-0 sm:gap-0 justify-center mb-6"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Featured Products Category */}
          {hasFeaturedProducts && (
            <motion.button
              onClick={() => setSelectedCategory('featured')}
              className={`p-2 sm:p-4 rounded-xl transition-all duration-300 ${
                selectedCategory === 'featured'
                  ? `relative py-1.5 sm:py-2 px-3 sm:px-5 bg-[#ffd453] rounded-full flex items-center justify-center text-[#1c594e] gap-1.5 sm:gap-2.5 font-bold border-[2px] sm:border-[3px] border-[#ffd453]/30 outline-none overflow-hidden text-[12px] sm:text-[15px] shadow-xl hover:scale-105`
                  : 'bg-[#26bd7e]/20 text-[#26bd7e] hover:bg-[#26bd7e]/30 hover:shadow-md'
              }`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <h3 className="text-sm sm:text-lg font-semibold flex items-center gap-1 sm:gap-2">
                <span className="text-blue-400">✨</span> {language === 'ar' ? 'أحدث العروض' : 'Latest Offers'}
              </h3>
            </motion.button>
          )}

          {/* Best Sellers Category */}
          {hasBestSellerProducts && (
            <motion.button
              onClick={() => setSelectedCategory('best_sellers')}
              className={`p-2 sm:p-4 rounded-xl transition-all duration-300 ${
                selectedCategory === 'best_sellers'
                  ? `relative py-1.5 sm:py-2 px-3 sm:px-5 bg-[#ffd453] rounded-full flex items-center justify-center text-[#1c594e] gap-1.5 sm:gap-2.5 font-bold border-[2px] sm:border-[3px] border-[#ffd453]/30 outline-none overflow-hidden text-[12px] sm:text-[15px] shadow-xl hover:scale-105`
                  : 'bg-[#ffd453]/10 text-[#ffd453] hover:bg-[#ffd453]/20 hover:shadow-md'
              }`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <h3 className="text-sm sm:text-lg font-semibold flex items-center gap-1 sm:gap-2">
                <span className="text-red-400">🔥</span> {language === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers'}
              </h3>
            </motion.button>
          )}
        </motion.div>

        {/* Regular Categories */}
        <motion.div
          className="flex flex-wrap gap-2 sm:gap-4 justify-center mb-12"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* All Products Button - moved here with regular categories */}
          <motion.button
            onClick={() => setSelectedCategory(null)}
            className={`p-2 sm:p-4 rounded-xl transition-all duration-300 ${
              !selectedCategory
                ? `relative py-1.5 sm:py-2 px-3 sm:px-5 bg-[#ffd453] rounded-full flex items-center justify-center text-[#1c594e] gap-1.5 sm:gap-2.5 font-bold border-[2px] sm:border-[3px] border-[#ffd453]/30 outline-none overflow-hidden text-[12px] sm:text-[15px] shadow-xl hover:scale-105`
                : 'bg-white/10 text-white hover:bg-white/20 hover:shadow-md'
            }`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <h3 className="text-sm sm:text-lg font-semibold">{language === 'ar' ? 'الكل' : 'All'}</h3>
          </motion.button>

          <AnimatePresence>
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-2 sm:p-4 rounded-xl transition-all duration-300 ${
                    selectedCategory === category.id
                      ? `relative py-1.5 sm:py-2 px-3 sm:px-5 bg-[#ffd453] rounded-full flex items-center justify-center text-[#1c594e] gap-1.5 sm:gap-2.5 font-bold border-[2px] sm:border-[3px] border-[#ffd453]/30 outline-none overflow-hidden text-[12px] sm:text-[15px] shadow-xl hover:scale-105`
                      : 'bg-white/10 text-white hover:bg-white/20 hover:shadow-md'
                  }`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <h3 className="text-sm sm:text-lg font-semibold">
                  {language === 'ar' ? category.name : (category.name_en || category.name)}
                </h3>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          <AnimatePresence mode="wait">
            {filteredServices().length > 0 ? (
              filteredServices().map((service) => (
                <motion.div
                  key={service.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -20 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <ServiceCard
                    id={service.id}
                    title={service.title}
                    description={service.description || ''}
                    description_en={service.description_en || null}
                    imageUrl={service.image_url || ''}
                    price={service.price || ''}
                    salePrice={service.sale_price || null}
                    hasMultipleSizes={service.has_multiple_sizes}
                    minPrice={getMinPrice(service)}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                key="no-services"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center text-white text-xl"
                 transition={{ duration: 0.5 }}
              >
                {language === 'ar' ? 'لا توجد منتجات في هذا القسم.' : 'No products in this category.'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}