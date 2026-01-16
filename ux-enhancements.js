// ============================================
// RANDEVUM - UX İyileştirme Modülü v1.0
// ============================================
// 1. Telefon/İsim Hatırlama (LocalStorage)
// 2. Modern Toast Bildirimleri
// 3. Randevu Özeti Paylaşım
// ============================================

const RandevumUX = {
    
    // LocalStorage anahtarları
    STORAGE_KEYS: {
        customerName: 'randevum_customer_name',
        customerPhone: 'randevum_customer_phone',
        recentSalons: 'randevum_recent_salons',
        favorites: 'randevum_favorites'
    },

    // ==================== 1. TELEFON/İSİM HATIRLA ====================
    
    /**
     * Müşteri bilgilerini kaydet
     */
    saveCustomerInfo(name, phone) {
        try {
            if (name) localStorage.setItem(this.STORAGE_KEYS.customerName, name);
            if (phone) localStorage.setItem(this.STORAGE_KEYS.customerPhone, phone);
            console.log('[UX] Müşteri bilgileri kaydedildi');
        } catch (e) {
            console.warn('[UX] LocalStorage hatası:', e);
        }
    },

    /**
     * Kaydedilmiş müşteri bilgilerini getir
     */
    getCustomerInfo() {
        try {
            return {
                name: localStorage.getItem(this.STORAGE_KEYS.customerName) || '',
                phone: localStorage.getItem(this.STORAGE_KEYS.customerPhone) || ''
            };
        } catch (e) {
            return { name: '', phone: '' };
        }
    },

    /**
     * Form alanlarını otomatik doldur
     */
    autoFillCustomerForm() {
        const info = this.getCustomerInfo();
        
        const nameInput = document.getElementById('customerName');
        const phoneInput = document.getElementById('customerPhone');
        
        if (nameInput && info.name && !nameInput.value) {
            nameInput.value = info.name;
        }
        
        if (phoneInput && info.phone && !phoneInput.value) {
            // Telefonu formatla: 5XX XXX XX XX
            const formatted = this.formatPhoneDisplay(info.phone);
            phoneInput.value = formatted;
        }
        
        // Doğrulama telefon alanını da doldur
        const verifyPhone = document.getElementById('verifyPhone');
        if (verifyPhone && info.phone && !verifyPhone.value) {
            verifyPhone.value = this.formatPhoneDisplay(info.phone);
        }
        
        // AI öneri için de telefonu hazırla
        if (info.phone) {
            window.savedCustomerPhone = info.phone;
        }
        
        if (info.name || info.phone) {
            console.log('[UX] Form otomatik dolduruldu');
        }
    },

    /**
     * Telefon numarasını gösterim formatına çevir
     */
    formatPhoneDisplay(phone) {
        const clean = phone.replace(/\D/g, '').slice(-10);
        if (clean.length === 10) {
            return `${clean.slice(0,3)} ${clean.slice(3,6)} ${clean.slice(6,8)} ${clean.slice(8)}`;
        }
        return clean;
    },

    /**
     * "Beni Hatırla" checkbox'ı ekle
     */
    addRememberMeCheckbox() {
        const phoneInput = document.getElementById('customerPhone');
        if (!phoneInput) return;
        
        const formGroup = phoneInput.closest('.form-group');
        if (!formGroup || formGroup.querySelector('.remember-me')) return;
        
        const info = this.getCustomerInfo();
        const isChecked = info.phone ? 'checked' : '';
        
        const rememberDiv = document.createElement('div');
        rememberDiv.className = 'remember-me';
        rememberDiv.innerHTML = `
            <label class="remember-label">
                <input type="checkbox" id="rememberMe" ${isChecked}>
                <span class="remember-text">Bilgilerimi hatırla</span>
            </label>
        `;
        
        formGroup.appendChild(rememberDiv);
    },

    // ==================== 2. TOAST BİLDİRİMLERİ ====================
    
    /**
     * Toast container oluştur (yoksa)
     */
    ensureToastContainer() {
        if (document.getElementById('toastContainer')) return;
        
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    },

    /**
     * Toast göster
     * @param {string} message - Mesaj
     * @param {string} type - success | error | warning | info
     * @param {number} duration - Süre (ms)
     */
    showToast(message, type = 'info', duration = 3000) {
        this.ensureToastContainer();
        const container = document.getElementById('toastContainer');
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        // Animasyon için timeout
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Otomatik kaldır
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    },

    // Kısa yollar
    success(message, duration) { return this.showToast(message, 'success', duration); },
    error(message, duration) { return this.showToast(message, 'error', duration); },
    warning(message, duration) { return this.showToast(message, 'warning', duration); },
    info(message, duration) { return this.showToast(message, 'info', duration); },

    // ==================== 3. RANDEVU ÖZETİ PAYLAŞ ====================
    
    /**
     * Randevu özeti metnini oluştur
     */
    generateAppointmentSummary(apt) {
        const dateFormatted = this.formatDate(apt.date);
        
        return `📅 RANDEVU BİLGİLERİ

💈 Salon: ${apt.salonName}
📍 Hizmet: ${apt.service}
📆 Tarih: ${dateFormatted}
⏰ Saat: ${apt.time}
💰 Tutar: ${apt.servicePrice} ₺
${apt.staffName && apt.staffName !== 'Belirtilmedi' ? `✂️ Personel: ${apt.staffName}` : ''}

Randevum ile alındı 💈
${window.location.origin}`;
    },

    /**
     * Randevu özetini panoya kopyala
     */
    async copyAppointmentSummary(apt) {
        const summary = this.generateAppointmentSummary(apt);
        
        try {
            await navigator.clipboard.writeText(summary);
            this.success('Randevu bilgileri kopyalandı!');
            return true;
        } catch (e) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = summary;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
            this.success('Randevu bilgileri kopyalandı!');
            return true;
        }
    },

    /**
     * Randevuyu WhatsApp'ta paylaş
     */
    shareViaWhatsApp(apt) {
        const summary = this.generateAppointmentSummary(apt);
        const encoded = encodeURIComponent(summary);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
        this.success('WhatsApp açılıyor...');
    },

    /**
     * Native share API (destekleniyorsa)
     */
    async shareNative(apt) {
        const summary = this.generateAppointmentSummary(apt);
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Randevu Bilgilerim',
                    text: summary
                });
                this.success('Paylaşıldı!');
                return true;
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.warn('[UX] Share hatası:', e);
                }
            }
        }
        
        // Fallback: WhatsApp
        this.shareViaWhatsApp(apt);
        return false;
    },

    /**
     * Paylaşım butonlarını success modal'a ekle
     */
    addShareButtons(apt) {
        const successModal = document.getElementById('successModal');
        if (!successModal) return;
        
        // Mevcut paylaşım butonları varsa kaldır
        const existingShare = successModal.querySelector('.share-buttons');
        if (existingShare) existingShare.remove();
        
        const shareDiv = document.createElement('div');
        shareDiv.className = 'share-buttons';
        shareDiv.innerHTML = `
            <p class="share-label">Randevu bilgilerini paylaş:</p>
            <div class="share-btn-group">
                <button class="share-btn share-copy" onclick="RandevumUX.copyAppointmentSummary(window.lastAppointment)">
                    📋 Kopyala
                </button>
                <button class="share-btn share-whatsapp" onclick="RandevumUX.shareViaWhatsApp(window.lastAppointment)">
                    💬 WhatsApp
                </button>
                ${navigator.share ? `
                <button class="share-btn share-native" onclick="RandevumUX.shareNative(window.lastAppointment)">
                    📤 Paylaş
                </button>
                ` : ''}
            </div>
        `;
        
        // Success details'den sonra ekle
        const successDetails = successModal.querySelector('#successDetails') || 
                              successModal.querySelector('.success-details');
        if (successDetails) {
            successDetails.after(shareDiv);
        } else {
            successModal.querySelector('.modal-body, .success-content')?.appendChild(shareDiv);
        }
    },

    // ==================== YARDIMCI FONKSİYONLAR ====================
    
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${days[date.getDay()]}`;
    },

    // ==================== BAŞLATMA ====================
    
    /**
     * Modülü başlat
     */
    init() {
        console.log('[UX] Modül başlatılıyor...');
        
        // Toast container oluştur
        this.ensureToastContainer();
        
        // CSS stilleri ekle
        this.injectStyles();
        
        // Form otomatik doldur (kısa gecikmeyle)
        setTimeout(() => {
            this.autoFillCustomerForm();
            this.addRememberMeCheckbox();
        }, 500);
        
        // Form submit'i intercept et (bilgileri kaydet)
        this.interceptFormSubmit();
        
        console.log('[UX] Modül hazır');
    },

    /**
     * Form submit'i yakala ve bilgileri kaydet
     */
    interceptFormSubmit() {
        const form = document.getElementById('bookingForm');
        if (!form) return;
        
        form.addEventListener('submit', () => {
            const rememberMe = document.getElementById('rememberMe');
            if (rememberMe?.checked) {
                const name = document.getElementById('customerName')?.value?.trim();
                const phone = document.getElementById('customerPhone')?.value?.replace(/\D/g, '');
                this.saveCustomerInfo(name, phone);
            }
        }, true);
    },

    /**
     * CSS stillerini inject et
     */
    injectStyles() {
        if (document.getElementById('randevum-ux-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'randevum-ux-styles';
        styles.textContent = `
            /* ========== TOAST BİLDİRİMLERİ ========== */
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            }
            
            @media (max-width: 480px) {
                .toast-container {
                    top: auto;
                    bottom: 20px;
                    right: 10px;
                    left: 10px;
                }
            }
            
            .toast {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 18px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                transform: translateX(120%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: auto;
                max-width: 380px;
            }
            
            @media (max-width: 480px) {
                .toast {
                    transform: translateY(120%);
                    max-width: 100%;
                }
            }
            
            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            @media (max-width: 480px) {
                .toast.show {
                    transform: translateY(0);
                }
            }
            
            .toast-icon {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                flex-shrink: 0;
            }
            
            .toast-success .toast-icon { background: #d1fae5; color: #059669; }
            .toast-error .toast-icon { background: #fee2e2; color: #dc2626; }
            .toast-warning .toast-icon { background: #fef3c7; color: #d97706; }
            .toast-info .toast-icon { background: #e0e7ff; color: #4f46e5; }
            
            .toast-message {
                flex: 1;
                font-size: 14px;
                font-weight: 500;
                color: #1e293b;
                line-height: 1.4;
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 18px;
                color: #94a3b8;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
                transition: color 0.2s;
            }
            
            .toast-close:hover {
                color: #64748b;
            }
            
            /* ========== BENİ HATIRLA ========== */
            .remember-me {
                margin-top: 8px;
            }
            
            .remember-label {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-size: 13px;
                color: #64748b;
            }
            
            .remember-label input[type="checkbox"] {
                width: 16px;
                height: 16px;
                accent-color: #6366f1;
                cursor: pointer;
            }
            
            .remember-text {
                user-select: none;
            }
            
            /* ========== PAYLAŞIM BUTONLARI ========== */
            .share-buttons {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            
            .share-label {
                font-size: 13px;
                color: #64748b;
                margin-bottom: 12px;
                text-align: center;
            }
            
            .share-btn-group {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .share-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 10px 16px;
                border: none;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .share-btn:active {
                transform: scale(0.96);
            }
            
            .share-copy {
                background: #f1f5f9;
                color: #475569;
            }
            
            .share-copy:hover {
                background: #e2e8f0;
            }
            
            .share-whatsapp {
                background: #25D366;
                color: white;
            }
            
            .share-whatsapp:hover {
                background: #128C7E;
            }
            
            .share-native {
                background: #6366f1;
                color: white;
            }
            
            .share-native:hover {
                background: #4f46e5;
            }
            
            /* ========== FORM İYİLEŞTİRMELERİ ========== */
            .form-input:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            
            .form-input.has-value {
                border-color: #10b981;
            }
            
            /* Otomatik doldurulmuş alan göstergesi */
            .form-input:-webkit-autofill,
            .form-input:autofill {
                box-shadow: 0 0 0 1000px #f0fdf4 inset !important;
                border-color: #10b981 !important;
            }
        `;
        
        document.head.appendChild(styles);
    }
};

// ==================== GLOBAL FONKSİYONLAR ====================

// Mevcut alert'leri toast ile değiştirmek için
window.showToast = (message, type) => RandevumUX.showToast(message, type);

// Global'e ekle
window.RandevumUX = RandevumUX;

// Sayfa yüklendiğinde başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RandevumUX.init());
} else {
    RandevumUX.init();
}

console.log('[UX] Modül yüklendi v1.0');
