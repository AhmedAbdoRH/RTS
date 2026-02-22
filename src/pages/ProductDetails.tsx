import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Service, ProductSize } from '../types/database';
import { MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<Service[]>([]);

  // Image slider states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTransform, setCurrentTransform] = useState('translateX(0)');
  const [prevTransform, setPrevTransform] = useState('translateX(0)');
  const [prevImageIndexState, setPrevImageIndexState] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { addToCart } = useCart();

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch service and suggested products on ID change
  useEffect(() => {
    if (id) {
      fetchService(id);
      setCurrentImageIndex(0); // Reset image index when product changes
    }
  }, [id]);

  // Fetch suggested products when service data is loaded
  useEffect(() => {
    if (service) {
      fetchSuggested();
    }
  }, [service]);

  const fetchService = async (serviceId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('services')
        .select('*, product_sizes(*)')
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Product not found');

      setService(data);
      if (data.has_multiple_sizes && data.product_sizes && data.product_sizes.length > 0) {
        // Sort sizes if needed or just pick the first one
        setSelectedSize(data.product_sizes[0]);
      } else {
        setSelectedSize(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  const fetchSuggested = async () => {
    if (!service) return;
    
    const { data } = await supabase
      .from('services')
      .select('*, product_sizes(*)')
      .eq('category_id', service.category_id) // Filter by the same category
      .neq('id', id) // Exclude current product
      .limit(10);
      
    setSuggested(data || []);
  };

  const { t, currentLanguage } = useLanguage();
  
  const handleContact = () => {
    if (!service) return;
    const productUrl = window.location.href;
    const price = selectedSize ? (selectedSize.sale_price || selectedSize.price) : (service.sale_price || service.price);
    const sizeText = selectedSize ? `\n${t('products.size') || 'المقاس'}: ${selectedSize.size}` : '';
    const message = `${t('whatsapp.orderMessage')}\n${service.title}${sizeText}\n${t('products.price')}: ${price}\n${productUrl}`;
    window.open(`https://wa.me/201557777587?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Get all images for the main product carousel
  const images: string[] = [
    service?.image_url || '',
    ...(Array.isArray(service?.gallery) ? service.gallery : [])
  ].filter(Boolean);

  // Automatic image cycling for the main product
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4500); // 4.5 seconds per image

    return () => clearInterval(interval);
  }, [images.length]);

  // Image transition effect
  const previousImageIndex = usePrevious(currentImageIndex);

  useEffect(() => {
    // Only apply transition if the image actually changed
    if (previousImageIndex !== undefined && previousImageIndex !== currentImageIndex) {
      setIsTransitioning(true);
      setPrevImageIndexState(previousImageIndex); // Store the previous image index

      // Start by positioning the new image to the right and the old image in place
      setCurrentTransform('translateX(100%)');
      setPrevTransform('translateX(0)');

      // Use requestAnimationFrame for smoother transition
      const raf = requestAnimationFrame(() => {
        setCurrentTransform('translateX(0)'); // New image slides into view
        setPrevTransform('translateX(-100%)'); // Old image slides out to the left
      });

      // Cleanup after transition
      const cleanupTimer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevImageIndexState(null); // Remove previous image from DOM after transition
      }, 1800); // Duration of the transition

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(cleanupTimer);
      };
    } else {
      // Reset transforms if no transition is needed (e.g., initial load or image changed to same image)
      setCurrentTransform('translateX(0)');
      setPrevTransform('translateX(0)');
      setPrevImageIndexState(null);
      setIsTransitioning(false);
    }
  }, [currentImageIndex, previousImageIndex]);


  // Extracted background styles for reuse
  const backgroundStyles = {
    backgroundColor: '#1c594e',
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center pt-24 bg-[#1c594e]"
      >
        <div className="text-xl text-[#ffd453]">Loading...</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24 bg-[#1c594e]"
      >
        <div className="text-xl text-[#ffd453]">{error || 'Product not found'}</div>
        <button
          onClick={() => navigate('/')}
          className="bg-[#ffd453] text-[#1c594e] px-6 py-2 rounded-md hover:brightness-110"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-24 relative" style={backgroundStyles}>
      {service && (
        <Helmet>
          <title>{service.title}</title>
          <meta
            name="description"
            content={(service.description_en && service.description_en.trim())
              ? service.description_en.slice(0, 200)
              : (service.description || '').slice(0, 200)}
          />
          <meta property="og:title" content={service.title} />
          <meta
            property="og:description"
            content={(service.description_en && service.description_en.trim())
              ? service.description_en.slice(0, 200)
              : (service.description || '').slice(0, 200)}
          />
          <meta property="og:type" content="product" />
          <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
          <meta property="og:image" content={(service.image_url || (Array.isArray(service.gallery) && service.gallery[0]) || '/logo.svg') as string} />
          <meta property="og:locale" content={currentLanguage === 'ar' ? 'ar_AR' : 'en_US'} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={service.title} />
          <meta
            name="twitter:description"
            content={(service.description_en && service.description_en.trim())
              ? service.description_en.slice(0, 200)
              : (service.description || '').slice(0, 200)}
          />
          <meta name="twitter:image" content={(service.image_url || (Array.isArray(service.gallery) && service.gallery[0]) || '/logo.svg') as string} />
        </Helmet>
      )}
      <div className="flex items-center justify-center flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl lg:max-w-5xl">
          <div className="rounded-md shadow-lg overflow-hidden glass">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="w-full aspect-square bg-gray-200 relative rounded-t-md md:rounded-none md:rounded-s-md overflow-hidden">
                  {prevImageIndexState !== null && isTransitioning && (
                    <img
                      src={images[prevImageIndexState]}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        transform: prevTransform,
                        zIndex: 10, // Ensure previous image is above current initially
                        transition: isTransitioning
                          ? 'transform 1800ms cubic-bezier(.4,0,.2,1)'
                          : 'none',
                        willChange: 'transform',
                      }}
                      draggable={false}
                    />
                  )}
                  <img
                    src={images[currentImageIndex] || ''}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      transform: currentTransform,
                      zIndex: 5, // Ensure current image slides under previous or comes to front
                      transition: isTransitioning
                        ? 'transform 1800ms cubic-bezier(.4,0,.2,1)'
                        : 'none',
                      willChange: 'transform',
                    }}
                    draggable={false}
                  />
                  {images.length > 1 && (
                    <>
                      {/* Image indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {images.map((img, idx) => (
                          <button
                            key={img + idx}
                            className={`w-2 h-2 rounded-md border-none transition-colors ease-in-out duration-500 ${
                              currentImageIndex === idx ? 'bg-[#ffd453]' : 'bg-white/30'
                            }`}
                            onClick={() => setCurrentImageIndex(idx)}
                            aria-label={`عرض الصورة رقم ${idx + 1}`}
                            type="button"
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <h1 className="text-3xl font-bold mb-4 text-[#ffd453] text-right">{service.title}</h1>
                <p className="text-white text-opacity-88 mb-6 text-lg leading-relaxed text-right" style={{ whiteSpace: 'pre-wrap' }}>
                  {(currentLanguage === 'en' && service.description_en && service.description_en.trim())
                    ? service.description_en
                    : service.description}
                </p>
                <div className="border-t border-white/10 pt-6 mb-6">
                  {/* Size Selection */}
                  {service.has_multiple_sizes && service.product_sizes && service.product_sizes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-[#ffd453] font-bold mb-3 text-right">{t('products.size') || 'المقاس'}:</h3>
                      <div className="flex flex-wrap justify-end gap-3">
                        {service.product_sizes.map((size) => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-md border transition-colors ${
                              selectedSize?.id === size.id
                                ? 'bg-[#ffd453] text-[#1c594e] border-[#ffd453] font-bold'
                                : 'bg-transparent text-white border-white/30 hover:border-[#ffd453]'
                            }`}
                          >
                            {size.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                    <div className="text-2xl font-bold text-[#ffd453] mb-6 text-right">
                    {(selectedSize ? selectedSize.sale_price : service.sale_price) ? (
                      <div className="flex flex-col items-end">
                        <span className="text-2xl text-[#ffd453]">
                          {selectedSize ? selectedSize.sale_price : service.sale_price} {t('currency') || 'ج.م'}
                        </span>
                        <span className="text-lg text-white/40 line-through">
                          {selectedSize ? selectedSize.price : service.price} {t('currency') || 'ج.م'}
                        </span>
                      </div>
                    ) : (
                      <span>{selectedSize ? selectedSize.price : service.price} {t('currency') || 'ج.م'}</span>
                    )}
                  </div>
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={handleContact}
                      className="green-button flex-1 flex items-center justify-center gap-2"
                    >
                      <div className="green-button-border"></div>
                      <MessageCircle className="h-5 w-5" />
                      {t('products.contactOrder')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const price = (selectedSize ? (selectedSize.sale_price || selectedSize.price) : (service.sale_price || service.price)) || '0';
                        addToCart({
                          id: selectedSize ? `${service.id}-${selectedSize.id}` : service.id,
                          title: selectedSize ? `${service.title} - ${selectedSize.size}` : service.title,
                          price: price,
                          imageUrl: service.image_url || ''
                        });
                        toast.success('تمت إضافة المنتج إلى السلة');
                      }}
                      className="yellow-button yellow-cart-button flex items-center justify-center"
                      title="أضف إلى السلة"
                    >
                      <div className="yellow-button-border"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Products */}
      {suggested.length > 0 && (
        <div className="container mx-auto px-4 max-w-4xl lg:max-w-5xl mb-8">
          <h2 className="text-xl font-bold text-secondary mb-4 text-right">{t('products.alsoAvailable')}</h2>
          <div
            className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {suggested.map((item) => {
              const images: string[] = [
                item.image_url || '',
                ...(Array.isArray(item.gallery) ? item.gallery : [])
              ].filter(Boolean);
              const imageUrl = images[0] || '';

              return (
                <div
                  key={item.id}
                  className="
                    min-w-[160px] max-w-[180px]
                    md:min-w-[220px] md:max-w-[260px]
                    bg-white/10 rounded-md shadow p-2 flex-shrink-0 cursor-pointer hover:scale-105 transition
                  "
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-24 md:h-40 object-cover rounded"
                  />
                  <div className="mt-2 text-sm md:text-base font-bold text-secondary truncate text-right">{item.title}</div>
                  <div className="flex flex-col items-end">
                    {item.has_multiple_sizes && getMinPrice(item) ? (
                      <>
                        <span className="text-xs text-white/70">{t('products.startsFrom') || 'يبدأ من'}</span>
                        <span className="text-xs md:text-sm text-[#ffd453]">{getMinPrice(item)} {t('currency') || 'ج.م'}</span>
                      </>
                    ) : item.sale_price ? (
                      <>
                        <span className="text-xs md:text-sm text-[#ffd453]">{item.sale_price} {t('currency') || 'ج.م'}</span>
                        <span className="text-xs text-gray-400 line-through">{item.price} {t('currency') || 'ج.م'}</span>
                      </>
                    ) : (
                      <span className="text-xs md:text-sm text-accent">{item.price} {t('currency') || 'ج.م'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Styles to hide scrollbar */}
          <style>{`
            .hide-scrollbar {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}

      {/* Back to Home button */}
      <div className="flex justify-center pb-8">
        <button
          onClick={() => navigate('/')}
          className="text-secondary hover:text-accent px-4 py-2 rounded-md border border-secondary hover:border-accent"
        >
          ← العودة للرئيسية
        </button>
      </div>
    </div>
  );
}
