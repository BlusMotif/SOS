import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'tw', name: 'Akan/Twi' },
    { code: 'ee', name: 'Ewe' },
    { code: 'ga', name: 'Ga' },
    { code: 'dag', name: 'Dagbani' }
  ];

  return (
    <Select 
      value={i18n.language} 
      onValueChange={(language) => i18n.changeLanguage(language)}
      data-testid="language-selector"
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map(lang => (
          <SelectItem key={lang.code} value={lang.code} data-testid={`language-option-${lang.code}`}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
