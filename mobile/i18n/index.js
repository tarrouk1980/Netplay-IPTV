import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const translations = {
  fr: {
    // Navigation
    home: 'Accueil',
    profile: 'Profil',
    settings: 'Paramètres',
    history: 'Historique',
    // Auth
    login: 'Connexion',
    register: "S'inscrire",
    logout: 'Déconnexion',
    phone: 'Téléphone',
    password: 'Mot de passe',
    // Services
    taxi: 'Taxi',
    sos: 'SOS Remorquage',
    delivery: 'Livraison',
    grocery: 'Courses',
    backHomeRide: 'Back Home Ride',
    // Actions
    confirm: 'Confirmer',
    cancel: 'Annuler',
    next: 'Suivant',
    back: 'Retour',
    send: 'Envoyer',
    save: 'Enregistrer',
    // Status
    pending: 'En attente',
    accepted: 'Acceptée',
    inProgress: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée',
    // Common
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    success: 'Succès',
    noData: 'Aucune donnée',
    search: 'Rechercher',
    // Wallet
    balance: 'Solde',
    recharge: 'Recharger',
    // Payment
    pay: 'Payer',
    payWith: 'Payer avec',
    total: 'Total',
  },
  ar: {
    home: 'الرئيسية',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    history: 'التاريخ',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    phone: 'الهاتف',
    password: 'كلمة المرور',
    taxi: 'تاكسي',
    sos: 'إنقاذ السيارة',
    delivery: 'توصيل',
    grocery: 'تسوق',
    backHomeRide: 'رحلة العودة',
    confirm: 'تأكيد',
    cancel: 'إلغاء',
    next: 'التالي',
    back: 'رجوع',
    send: 'إرسال',
    save: 'حفظ',
    pending: 'في الانتظار',
    accepted: 'مقبولة',
    inProgress: 'جارية',
    completed: 'مكتملة',
    cancelled: 'ملغاة',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'نجاح',
    noData: 'لا توجد بيانات',
    search: 'بحث',
    balance: 'الرصيد',
    recharge: 'شحن',
    pay: 'دفع',
    payWith: 'ادفع بـ',
    total: 'المجموع',
  },
  en: {
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    history: 'History',
    login: 'Login',
    register: 'Sign Up',
    logout: 'Logout',
    phone: 'Phone',
    password: 'Password',
    taxi: 'Taxi',
    sos: 'SOS Towing',
    delivery: 'Delivery',
    grocery: 'Grocery',
    backHomeRide: 'Back Home Ride',
    confirm: 'Confirm',
    cancel: 'Cancel',
    next: 'Next',
    back: 'Back',
    send: 'Send',
    save: 'Save',
    pending: 'Pending',
    accepted: 'Accepted',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    noData: 'No data',
    search: 'Search',
    balance: 'Balance',
    recharge: 'Top Up',
    pay: 'Pay',
    payWith: 'Pay with',
    total: 'Total',
  },
};

let currentLang = 'fr';

export async function initI18n() {
  try {
    const saved = await AsyncStorage.getItem('appLanguage');
    if (saved && translations[saved]) {
      currentLang = saved;
      if (saved === 'ar') I18nManager.forceRTL(true);
      else I18nManager.forceRTL(false);
    }
  } catch {}
}

export async function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  await AsyncStorage.setItem('appLanguage', lang);
  if (lang === 'ar') I18nManager.forceRTL(true);
  else I18nManager.forceRTL(false);
}

export function t(key) {
  return translations[currentLang]?.[key] || translations['fr']?.[key] || key;
}

export function getCurrentLang() { return currentLang; }
export function isRTL() { return currentLang === 'ar'; }
