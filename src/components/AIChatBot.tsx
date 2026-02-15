import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, MessageSquare, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase'; // تأكد من أن مسار supabase صحيح
import type { Service, Category, StoreSettings } from '../types/database'; // تأكد من أن مسار الأنواع صحيح

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

// =====================
// إعدادات Groq API
// =====================
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; 
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"; 
const GROQ_MODEL = "openai/gpt-oss-120b"; 

const RenderMessageWithLinks = ({ text }: { text: string }) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = text.split(linkRegex);

    return (
        <div className="whitespace-pre-wrap font-medium">
            {parts.map((part, i) => {
                if (i % 3 === 1) {
                    const url = parts[i + 1];
                    return (
                        <React.Fragment key={i}>
                            <span>{part}</span>
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 mb-2 flex items-center justify-center gap-2 text-center bg-[#26bd7e]/20 hover:bg-[#26bd7e]/40 text-[#26bd7e] font-semibold py-1.5 px-3 rounded-lg transition-all border border-[#26bd7e]/50"
                            >
                                <ExternalLink className="w-3 h-3" />
                                عرض المنتج
                            </a>
                        </React.Fragment>
                    );
                }
                if (i % 3 === 2) {
                    return null;
                }
                return <span key={i}>{part}</span>;
            })}
        </div>
    );
};

export default function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'أهلاً بيك في شركة الريان للحلول التكنولوجية 🏗️\nازاي أقدر أساعدك في أنظمة الأبواب الأوتوماتيك؟',
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [storeData, setStoreData] = useState<{
        products: Service[];
        categories: Category[];
        storeSettings: StoreSettings | null;
    }>({
        products: [],
        categories: [],
        storeSettings: null
    });

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && storeData.products.length === 0) {
            fetchStoreData();
        }
    }, [isOpen]);

    const fetchStoreData = async () => {
        try {
            const { data: products, error: productsError } = await supabase
                .from('services')
                .select(`
                    *,
                    category:categories(*),
                    sizes:product_sizes(*)
                `)
                .order('created_at', { ascending: false });
            if (productsError) throw productsError;
            
            // Debug: Log the actual data to see what we're getting
            console.log('ChatBot Debug - Products with sizes:', products);

            const { data: categories, error: categoriesError } = await supabase.from('categories').select('*').order('name');
            if (categoriesError) throw categoriesError;

            const { data: storeSettings, error: storeError } = await supabase.from('store_settings').select('*').single();
            if (storeError && storeError.code !== 'PGRST116') console.error('Error fetching store settings:', storeError);

            setStoreData({ products: products || [], categories: categories || [], storeSettings: storeSettings || null });
        } catch (error) {
            console.error('Error fetching store data:', error);
        }
    };

    const generateStoreContext = () => {
        const { products, storeSettings } = storeData;
        let context = `أنت مساعد ذكي لشركة "الريان للحلول التكنولوجية لأنظمة الأبواب الأوتوماتيك".

معلومات عن الشركة:
- التخصص: توريد وتركيب الأبواب الأوتوماتيك، الشيش الحصير، الهاندريل، وكبائن الحمامات.
- العملاء المستهدفون: البنوك، الشركات، المولات، المستشفيات، القرى السياحية، والفلل.
- الجودة: نستخدم أجود أنواع الخامات المعدنية مع دهان إلكتروستاتيك مانع للصدأ، بمواصفات عالمية.
- المواتير: نوفر جميع أنواع المواتير (آلية التحريك) المستوردة الأصلية.
- المعاينة: نرسل مهندس فني للمعاينة ورفع المقاسات مجاناً وتقديم العرض المناسب.
- التغطية: نغطي جميع محافظات مصر ولنا سابقة أعمال مميزة في كل مكان.
- التركيب: يتم بواسطة فريق من أمهر الفنيين المدربين تحت إشراف هندسي كامل مع الالتزام بقواعد الأمان.
- الدقة والسرعة: التوريد والتركيب يتم خلال 48 ساعة فقط من تاريخ التعاقد.
- الأمان والضمان: نوفر أعلى مستويات الأمان مع شهادة ضمان وخدمة ما بعد البيع مدى الحياة.
- النبذة التعريفية: تأسست شركة الريان في عام 1998، وهي الشركة الرائدة في مصر في تصنيع وتوريد الأبواب الرول وأنظمة الدخول المختلفة للمنشآت الصناعية والتجارية والسكنية.

`;

        if (products.length > 0) {
            context += `الخدمات والمنتجات المتاحة حالياً:\n`;
            products.forEach(product => {
                const productUrl = `https://alsamah-store.com/product/${product.id}`;
                context += `\n--- ${product.title} ---\n`;
                context += `الوصف: ${product.description || 'لا يوجد وصف متاح'}\n`;
                
                // معالجة الأسعار المتعددة
                if (product.has_multiple_sizes && product.sizes && product.sizes.length > 0) {
                    context += `الأسعار المتاحة (حسب المقاس/المواصفات):\n`;
                    
                    // ترتيب المقاسات حسب السعر
                    const sortedSizes = product.sizes.sort((a: any, b: any) => {
                        const priceA = parseFloat(a.sale_price as any) || parseFloat(a.price as any);
                        const priceB = parseFloat(b.sale_price as any) || parseFloat(b.price as any);
                        return priceA - priceB;
                    });
                    
                    sortedSizes.forEach((size: any) => {
                        if (size.sale_price) {
                            context += `  - ${size.size}: ${size.sale_price} ج.م (بعد الخصم) - السعر الأصلي: ${size.price} ج.م\n`;
                        } else {
                            context += `  - ${size.size}: ${size.price} ج.م\n`;
                        }
                    });
                    
                    const validSalePrices = product.sizes
                        .map((s: any) => parseFloat(s.sale_price as any))
                        .filter((p: any) => !isNaN(p) && p > 0);
                    
                    if (validSalePrices.length > 0) {
                        const minSalePrice = Math.min(...validSalePrices);
                        context += `  يبدأ السعر من: ${minSalePrice} ج.م\n`;
                    }
                } else {
                    if (product.price) context += `السعر: ${product.price} ج.م\n`;
                    if (product.sale_price) context += `السعر بعد الخصم: ${product.sale_price} ج.م\n`;
                }
                
                if (product.category?.name) context += `الفئة: ${product.category.name}\n`;
                context += `الرابط للاستخدام في الرد: ${productUrl}\n`;
            });
            context += '\n';
        }

        context += `تعليمات الرد:
1.  كن ودود وتحدث باللهجة المصرية العامية المحترمة.
2.  أكد دائماً على سرعة التوريد والتركيب (خلال 48 ساعة) وجودة الخامات (مانعة للصدأ).
3.  ركز على أن المعاينة بتتم عن طريق مهندس فني متخصص لرفع المقاسات.
4.  عند اقتراح أي خدمة، اذكر مميزاتها الفنية ثم ضع الرابط باستخدام تنسيق الماركدون: [اسم الخدمة ومميزاتها](رابط الخدمة).
5.  مهم جداً: لا تعرض المنتجات في جداول. كل خدمة في فقرة خاصة مع زر "عرض المنتج" تحتها.
6.  استخدم إيموجيز بسيطة مثل (🏗️, 🚪, 🛡️, ⚙️, 🇪🇬).
7.  لا تذكر رقم الواتساب إلا إذا طلبه العميل بشكل صريح.
8.  نادي العميل بكلمة "يا فندم".
9.  وضح أن الضمان وخدمة ما بعد البيع "مدى الحياة".
10. قبل اسم الخدمة ضيف ▫️
11. رقم التواصل للشركة: 0 10 27381559.
12. استخدم صياغة محايدة أو مذكر.
.`;

        return context;
    };

    // ========================================================================
    // تعديل: تم تحديث الدالة بالكامل للتعامل مع Groq API
    // ========================================================================
    const sendToAI = async (userMessage: string): Promise<string> => {
        const systemPrompt = generateStoreContext();

        // إعداد الرسائل بتنسيق OpenAI/Groq
        const groqMessages = [
            {
                "role": "system",
                "content": systemPrompt
            },
            ...messages.slice(-5).map(msg => ({
                "role": msg.isUser ? "user" : "assistant",
                "content": msg.text
            })),
            {
                "role": "user",
                "content": userMessage
            }
        ];

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: groqMessages,
                    temperature: 0.7,
                    max_tokens: 1024,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`فشل في الاتصال بالخدمة: ${errorData.error?.message || 'خطأ غير معروف'}`);
            }

            const data = await response.json();
            // استخلاص النص من استجابة Groq
            const textResponse = data?.choices?.[0]?.message?.content;

            return textResponse?.trim() || 'معلش، مافهمتش سؤالك \nممكن توضحلي محتاج ايه بالظبط.';

        } catch (error) {
            console.error('Error calling Groq API:', error);
            return '⚠️ حدث خطأ تقني.';
        }
    };


    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const lastMessageIsFromUser = messages[messages.length - 1]?.isUser;
        const lastElement = container.lastElementChild;

        if (lastMessageIsFromUser || isLoading) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        } else if (lastElement && lastElement instanceof HTMLElement) {
            lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, isLoading]);

    useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), text: inputText.trim(), isUser: true, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const aiResponse = await sendToAI(userMessage.text);
            setTimeout(() => {
                const botMessage: Message = { id: (Date.now() + 1).toString(), text: aiResponse, isUser: false, timestamp: new Date() };
                setMessages(prev => [...prev, botMessage]);
                setIsLoading(false);
            }, 400);
        } catch (error) {
            const errorMessage: Message = { id: (Date.now() + 1).toString(), text: '⚠️ عذراً، حدث خطأ.', isUser: false, timestamp: new Date() };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    };

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 p-4 rounded-full shadow-lg transition-all text-white bg-gradient-to-r from-[#26bd7e] to-[#ffd453] hover:brightness-110 z-50 group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <MessageCircle className="h-6 w-6 text-[#1c594e]" />
                <span className="absolute -top-2 -right-2 w-3 h-3 bg-[#ffd453] rounded-full animate-pulse"></span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed bottom-24 left-6 w-80 h-96 bg-[#1c594e]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#ffd453]/20 z-50 flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-[#ffd453]/20 bg-gradient-to-r from-[#26bd7e]/20 to-[#ffd453]/20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
                                    <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                                </div>
                                <div>
                                    <h3 className="text-[#ffd453] font-semibold text-sm">مساعد شركة الريان الذكي</h3>
                                    <p className="text-[#26bd7e] text-xs">متصل الآن</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-[#ffd453] transition-colors p-1"><X className="h-5 w-5" /></button>
                        </div>
                        
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-start gap-2 max-w-[95%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden ${message.isUser ? 'bg-[#ffd453]' : 'bg-white/20 border border-white/10'}`}>
                                            {message.isUser ? (
                                                <User className="h-3 w-3 text-[#1c594e]" />
                                            ) : (
                                                <img src="/logo.png" alt="Bot" className="w-4 h-4 object-contain" />
                                            )}
                                        </div>
                                        <div className={`flex flex-col gap-1 ${message.isUser ? 'items-end' : 'items-start'}`}>
                                            <div className={`rounded-2xl px-3 py-2 text-[13.6px] flex flex-col ${message.isUser ? 'bg-[#ffd453] text-[#1c594e] rounded-br-none' : 'bg-white/10 text-white rounded-bl-none border border-white/20'}`}>
                                                <RenderMessageWithLinks text={message.text} />
                                                {!message.isUser && message.id !== '1' && (
                                                    <a href="https://wa.me/201027381559" target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 text-xs bg-[#26bd7e]/30 hover:bg-[#26bd7e]/50 text-white font-semibold py-1.5 px-3 rounded-lg transition-all border border-[#26bd7e]/50">
                                                        <MessageSquare className="w-3 h-3" /> تواصل واتساب مع الشركة
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 opacity-80 px-1">
                                                {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 bg-white/20 border border-white/10 rounded-full flex items-center justify-center overflow-hidden">
                                            <img src="/logo.png" alt="Loading" className="w-4 h-4 object-contain" />
                                        </div>
                                        <div className="bg-white/10 rounded-2xl px-3 py-2 border border-white/20">
                                            <div className="flex items-center">
                                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce mx-1"></div>
                                           <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce mx-1" style={{ animationDelay: '0.2s' }}></div>
                                           <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce mx-1" style={{ animationDelay: '0.4s' }}></div>
                                          </div>

                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/20 bg-black/50">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="اسأل عن الأبواب أو أنظمة الدخول..."
                                    disabled={isLoading}
                                    className="flex-1 bg-white/10 text-white placeholder-white/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-white/20 disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim() || isLoading}
                                    className="bg-[#ffd453] text-[#1c594e] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full transition-all flex items-center justify-center"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsOpen(false)} />}
            </AnimatePresence>
        </>
    );
}

