#!/usr/bin/env node

const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

const translations = [
  // Navigation translations
  { key: 'navigation.home', en: 'Home', ru: 'Главная', he: 'בית', category: 'navigation' },
  { key: 'navigation.courses', en: 'Courses', ru: 'Курсы', he: 'קורסים', category: 'navigation' },
  { key: 'navigation.pricing', en: 'Pricing', ru: 'Цены', he: 'תמחור', category: 'navigation' },
  { key: 'navigation.about', en: 'About', ru: 'О нас', he: 'אודות', category: 'navigation' },
  { key: 'navigation.contact', en: 'Contact', ru: 'Контакты', he: 'צור קשר', category: 'navigation' },
  { key: 'navigation.blog', en: 'Blog', ru: 'Блог', he: 'בלוג', category: 'navigation' },
  { key: 'navigation.pages', en: 'Pages', ru: 'Страницы', he: 'דפים', category: 'navigation' },
  { key: 'navigation.menu', en: 'Menu', ru: 'Меню', he: 'תפריט', category: 'navigation' },
  
  // Auth translations
  { key: 'auth.signin', en: 'Sign In', ru: 'Войти', he: 'התחבר', category: 'auth' },
  { key: 'auth.signup', en: 'Sign Up', ru: 'Регистрация', he: 'הרשמה', category: 'auth' },
  { key: 'auth.get_started', en: 'Get Started', ru: 'Начать', he: 'התחל', category: 'auth' },
  { key: 'auth.forgot_password', en: 'Forgot Password', ru: 'Забыли пароль', he: 'שכחת סיסמה', category: 'auth' },
  { key: 'auth.reset_password', en: 'Reset Password', ru: 'Сброс пароля', he: 'איפוס סיסמה', category: 'auth' },
  
  // Course translations
  { key: 'courses.ai_management', en: 'AI Manager', ru: 'Менеджер ИИ', he: 'מנהל AI', category: 'courses' },
  { key: 'courses.no_code', en: 'No-Code Development', ru: 'No-Code разработка', he: 'פיתוח No-Code', category: 'courses' },
  { key: 'courses.ai_video', en: 'AI Video & Avatar', ru: 'ИИ Видео и Аватар', he: 'וידאו ואווטאר AI', category: 'courses' },
  
  // Footer translations
  { key: 'footer.main_menu', en: 'Main Menu', ru: 'Главное меню', he: 'תפריט ראשי', category: 'common' },
  { key: 'footer.account', en: 'Account', ru: 'Аккаунт', he: 'חשבון', category: 'common' },
  { key: 'footer.utility_pages', en: 'Utility Pages', ru: 'Служебные страницы', he: 'דפי עזר', category: 'common' },
  { key: 'footer.contact', en: 'Contact', ru: 'Контакты', he: 'צור קשר', category: 'common' },
  { key: 'footer.newsletter', en: 'Newsletter', ru: 'Рассылка', he: 'ניוזלטר', category: 'common' },
  { key: 'footer.newsletter_placeholder', en: 'Enter your email', ru: 'Введите email', he: 'הכנס אימייל', category: 'forms' },
  { key: 'footer.description', en: 'Transform into an AI specialist', ru: 'Станьте специалистом по ИИ', he: 'הפוך למומחה AI', category: 'common' },
  { key: 'footer.copyright', en: '© 2025 ProjectDes AI Academy', ru: '© 2025 ProjectDes AI Academy', he: '© 2025 ProjectDes AI Academy', category: 'common' },
  { key: 'footer.all_rights_reserved', en: 'All rights reserved', ru: 'Все права защищены', he: 'כל הזכויות שמורות', category: 'common' },
  { key: 'footer.license', en: 'License', ru: 'Лицензия', he: 'רישיון', category: 'common' },
  { key: 'footer.changelog', en: 'Changelog', ru: 'История изменений', he: 'היסטוריית שינויים', category: 'common' },
  { key: 'footer.style_guide', en: 'Style Guide', ru: 'Руководство по стилю', he: 'מדריך סגנון', category: 'common' },
  
  // Contact translations
  { key: 'contact.phone', en: '+972 123-456-789', ru: '+972 123-456-789', he: '+972 123-456-789', category: 'common' },
  { key: 'contact.email', en: 'info@projectdes.ai', ru: 'info@projectdes.ai', he: 'info@projectdes.ai', category: 'common' },
  { key: 'contact.address', en: 'Tel Aviv, Israel', ru: 'Тель-Авив, Израиль', he: 'תל אביב, ישראל', category: 'common' },
  
  // Navigation extras
  { key: 'navigation.categories', en: 'Categories', ru: 'Категории', he: 'קטגוריות', category: 'navigation' },
  { key: 'navigation.protected', en: 'Protected', ru: 'Защищено', he: 'מוגן', category: 'navigation' },
  { key: 'navigation.not_found', en: 'Not Found', ru: 'Не найдено', he: 'לא נמצא', category: 'errors' },
  { key: 'navigation.utility', en: 'Utility', ru: 'Служебное', he: 'עזר', category: 'navigation' },
  { key: 'navigation.style_guide', en: 'Style Guide', ru: 'Руководство по стилю', he: 'מדריך סגנון', category: 'navigation' },
];

async function seedTranslations() {
  console.log('🌱 Seeding translations to Strapi...');
  
  for (const translation of translations) {
    try {
      // Create translation with approved status and publishedAt
      const response = await axios.post(`${STRAPI_URL}/api/translations`, {
        data: {
          key: translation.key,
          en: translation.en,
          ru: translation.ru,
          he: translation.he,
          category: translation.category,
          approvalStatus: 'approved',
          publishedAt: new Date().toISOString()
        }
      });
      
      console.log(`✅ Created translation: ${translation.key}`);
    } catch (error) {
      if (error.response) {
        console.error(`❌ Failed to create ${translation.key}:`, error.response.data);
      } else {
        console.error(`❌ Failed to create ${translation.key}:`, error.message);
      }
    }
  }
  
  console.log('✨ Translation seeding completed!');
}

seedTranslations().catch(console.error);