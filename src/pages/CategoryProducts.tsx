import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ServiceCard from '../components/ServiceCard';
import type { Service, Category, Subcategory } from '../types/database';
import { useLanguage } from '../contexts/LanguageContext';

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
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

      // Fetch subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId);

      if (subcategoriesError) {
        console.error('Error fetching subcategories:', subcategoriesError);
        throw subcategoriesError;
      }
      console.log('Fetched subcategories:', subcategoriesData);
      setSubcategories(subcategoriesData || []);

      // Fetch services for this category
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*, product_sizes(*)')
        .eq('category_id', categoryId);

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw servicesError;
      }
      console.log('Fetched services:', servicesData);
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

  const filteredServices = selectedSubcategory
    ? services.filter(service => service.subcategory_id === selectedSubcategory)
    : services;

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

          {/* Subcategories Filter */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8 justify-center">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedSubcategory === null
                    ? 'bg-[#ffd453] text-[#1c594e] font-bold shadow-lg scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`px-6 py-2 rounded-full transition-all ${
                    selectedSubcategory === sub.id
                      ? 'bg-[#ffd453] text-[#1c594e] font-bold shadow-lg scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {sub.name_ar}
                </button>
              ))}
            </div>
          )}

          {filteredServices.length === 0 ? (
            <p className="text-center text-white/70 py-8">
              {language === 'ar' ? 'لا توجد منتجات في هذا القسم حالياً' : 'No products in this category currently'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
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