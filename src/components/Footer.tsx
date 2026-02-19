import { Link } from 'react-router-dom';
import { Target, Facebook, Instagram, Twitter, Snail as Snapchat, Youtube } from 'lucide-react';
import type { StoreSettings } from '../types/database';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  storeSettings?: StoreSettings | null;
}

export default function Footer({ storeSettings }: FooterProps) {
  const { t } = useLanguage();
  const socialLinks = [
    { url: storeSettings?.facebook_url, icon: Facebook, label: 'Facebook' },
    { url: storeSettings?.instagram_url, icon: Instagram, label: 'Instagram' },
    { url: storeSettings?.twitter_url, icon: Twitter, label: 'Twitter' },
    { url: storeSettings?.snapchat_url, icon: Snapchat, label: 'Snapchat' },
    { url: storeSettings?.tiktok_url, icon: Youtube, label: 'TikTok' },
  ].filter(link => link.url);

  return (
    <footer className="bg-[#1c594e]/90 backdrop-blur-md border-t border-[#ffd453]/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {socialLinks.length > 0 && (
            <div className="flex gap-4 mb-4">
              {socialLinks.map((link, index) => (
                link.url && (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-[#ffd453] transition-colors duration-300"
                    title={link.label}
                  >
                    <link.icon className="h-6 w-6" />
                  </a>
                )
              ))}
            </div>
          )}

          <div className="flex flex-col items-center gap-1">
            <p className="text-white text-opacity-50 text-xs">
              {t('footer.developedBy')}
            </p>
            <a
              href="https://RehlatHadaf.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ffd453] underline hover:no-underline flex items-center gap-1.5 text-xs font-bold"
            >
              Rehlat Hadaf for Commercial Marketing
              <Target className="text-[#26bd7e] h-4 w-4" />
            </a>
          </div>

          <Link
            to="/admin/login"
            className="opacity-0 flex justify-center items-center text-xs mt-4"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
