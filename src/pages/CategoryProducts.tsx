import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ServiceCard from '../components/ServiceCard';
import type { Service, Category } from '../types/database';
import { useLanguage } from '../contexts/LanguageContext';

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndServices();
    }
  }, [categoryId]);

  const fetchCategoryAndServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch category details
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      // Fetch services for this category
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*, product_sizes(*)')
        .eq('category_id', categoryId);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);
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

  if (isLoading) {
    return (
      <div
        className="min-h-screen pt-24 flex items-center justify-center bg-[#1c594e]"
      >
        <div className="text-xl text-[#ffd453]">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div
        className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 bg-[#1c594e]"
      >
        <div className="text-xl text-[#ffd453]">
          {error || (language === 'ar' ? 'القسم غير موجود' : 'Category not found')}
        </div>
        <Link
          to="/"
          className="bg-[#ffd453] text-[#1c594e] px-6 py-2 rounded-md hover:brightness-110 transition-colors"
        >
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 bg-[#1c594e]"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="text-white/70 hover:text-[#ffd453] transition-colors">
            &larr; {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
          <h1 className="text-4xl font-bold text-[#ffd453] mt-4">
            {language === 'ar' ? category.name : (category.name_en || category.name)}
          </h1>
          <p className="text-white/60 mt-2">
            {language === 'ar' ? category.description : (category.description_en || category.description)}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-lg p-8 border border-white/10 shadow-2xl shadow-black/40">

          {services.length === 0 ? (
            <p className="text-center text-white/70 py-8">
              {language === 'ar' ? 'لا توجد منتجات في هذا القسم حالياً' : 'No products in this category currently'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}