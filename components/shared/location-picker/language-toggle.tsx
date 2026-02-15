'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LanguageToggleProps {
  language: 'en' | 'ar';
  onToggle: (language: 'en' | 'ar') => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1 bg-gray-50">
      <Button
        type="button"
        size="sm"
        variant={language === 'en' ? 'default' : 'ghost'}
        className="h-7 px-3 text-xs"
        onClick={() => onToggle('en')}
      >
        EN
      </Button>
      <Button
        type="button"
        size="sm"
        variant={language === 'ar' ? 'default' : 'ghost'}
        className="h-7 px-3 text-xs"
        onClick={() => onToggle('ar')}
      >
        ع
      </Button>
    </div>
  );
}
