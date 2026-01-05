// Firebase Configuration
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCa8jPQbymhS1XYUDCsw7B2gqlrygw1JDo",
    authDomain: "berber-randevum.firebaseapp.com",
    projectId: "berber-randevum",
    storageBucket: "berber-randevum.firebasestorage.app",
    messagingSenderId: "17054574072",
    appId: "1:17054574072:web:5a0af6b40a66171c64220d"
};

// Google Places API Configuration
const GOOGLE_PLACES_CONFIG = {
    apiKey: "AIzaSyCu91sRwR1Zp8_xFoBT2vZr6Sb9fBQkX9s",
    country: "tr"
};

// App Configuration
const APP_CONFIG = {
    // Randevu Ayarları
    appointment: {
        cleaningBreakMinutes: 5,        // Randevular arası temizlik molası (dakika)
        slotInterval: 15,               // Randevu slot aralığı (dakika)
        cancelDeadlineMinutes: 90,      // İptal son tarihi - randevudan kaç dakika önce
        reminderBeforeMinutes: 120,     // Hatırlatma zamanı - randevudan kaç dakika önce
        maxGalleryImages: 5,            // Maksimum galeri görseli
        defaultRating: 5.0              // Varsayılan puan
    },
    
    // QR Kod Ayarları
    qrCode: {
        size: 300,                  // QR kod boyutu (piksel)
        errorCorrectionLevel: 'M',  // Hata düzeltme seviyesi (L, M, Q, H)
        margin: 2                   // Kenar boşluğu
    },
    
    // Yorum Sistemi Ayarları
    review: {
        minRating: 1,
        maxRating: 5,
        requireVerifiedAppointment: true,  // Sadece randevusu olan yorum yapabilir
        reviewWindowDays: 7                // Randevudan sonra kaç gün içinde yorum yapılabilir
    },
    
    // Medya Ayarları
    media: {
        maxGalleryImages: 5,
        maxLogoSize: 2 * 1024 * 1024,      // 2MB
        maxImageSize: 5 * 1024 * 1024,     // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    
    categories: {
        berber: {
            name: 'Berber',
            icon: '💈',
            color: '#6366f1',
            description: 'Erkek berber salonları',
            services: [
                { id: 'sac-kesimi', name: 'Saç Kesimi', icon: '✂️', duration: 30, price: 150 },
                { id: 'sakal-trasi', name: 'Sakal Tıraşı', icon: '🪒', duration: 20, price: 100 },
                { id: 'sac-sakal', name: 'Saç + Sakal', icon: '💈', duration: 45, price: 200 },
                { id: 'sac-yikama', name: 'Saç Yıkama', icon: '💧', duration: 15, price: 50 },
                { id: 'cilt-bakimi', name: 'Cilt Bakımı', icon: '🧴', duration: 30, price: 150 },
                { id: 'cocuk-tiras', name: 'Çocuk Tıraşı', icon: '👦', duration: 20, price: 100 }
            ]
        },
        kuafor: {
            name: 'Kuaför',
            icon: '💇‍♀️',
            color: '#ec4899',
            description: 'Kadın kuaför salonları',
            services: [
                { id: 'sac-kesimi', name: 'Saç Kesimi', icon: '✂️', duration: 45, price: 200 },
                { id: 'fon', name: 'Fön', icon: '💨', duration: 30, price: 150 },
                { id: 'boya', name: 'Saç Boyama', icon: '🎨', duration: 120, price: 500 },
                { id: 'balyaj', name: 'Balyaj', icon: '✨', duration: 180, price: 800 },
                { id: 'manikur', name: 'Manikür', icon: '💅', duration: 45, price: 200 },
                { id: 'pedikur', name: 'Pedikür', icon: '🦶', duration: 60, price: 250 }
            ]
        },
        beauty: {
            name: 'Güzellik',
            icon: '💆',
            color: '#14b8a6',
            description: 'Güzellik ve spa merkezleri',
            services: [
                { id: 'cilt-bakimi', name: 'Cilt Bakımı', icon: '🧴', duration: 60, price: 300 },
                { id: 'masaj', name: 'Masaj', icon: '💆', duration: 60, price: 400 },
                { id: 'epilasyon', name: 'Epilasyon', icon: '✨', duration: 45, price: 250 },
                { id: 'kirpik', name: 'Kirpik Lifting', icon: '👁️', duration: 60, price: 350 },
                { id: 'kas-dizayn', name: 'Kaş Dizayn', icon: '✏️', duration: 30, price: 150 },
                { id: 'kalici-makyaj', name: 'Kalıcı Makyaj', icon: '💄', duration: 120, price: 1500 }
            ]
        }
    },
    packages: {
        starter: { 
            name: 'Starter', 
            price: 0, 
            limits: { monthlyAppointments: 50, staff: 1 },
            features: ['Temel randevu yönetimi', '1 personel']
        },
        pro: { 
            name: 'Pro', 
            price: 349, 
            limits: { monthlyAppointments: 500, staff: 5 },
            features: ['Sınırsız randevu', '5 personel', 'WhatsApp bildirimleri', 'Raporlar']
        },
        business: { 
            name: 'Business', 
            price: 699, 
            limits: { monthlyAppointments: -1, staff: -1 },
            features: ['Her şey sınırsız', 'Öncelikli destek', 'Öne çıkan listeleme']
        }
    },
    workingHours: {
        default: {
            mon: { open: '09:00', close: '20:00', active: true },
            tue: { open: '09:00', close: '20:00', active: true },
            wed: { open: '09:00', close: '20:00', active: true },
            thu: { open: '09:00', close: '20:00', active: true },
            fri: { open: '09:00', close: '20:00', active: true },
            sat: { open: '09:00', close: '18:00', active: true },
            sun: { open: '10:00', close: '16:00', active: false }
        }
    }
};

// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceId: 'service_nltn6di',
    templateApproval: 'template_k0an00y',
    templateNewSalon: 'template_qv6wzhj',
    templateNewAppointment: 'template_appointment',
    templateReminder: 'template_reminder',           // Randevu hatırlatma
    templateReschedule: 'template_reschedule',       // Randevu değişikliği
    publicKey: 'DFMgbrmsjlK0hxlc5'
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(FIREBASE_CONFIG);
}
