// ============================================
// RANDEVUM - UX İyileştirme Modülü v2.0
// ============================================
// 1. Telefon/İsim Hatırlama (LocalStorage)
// 2. Modern Toast Bildirimleri
// 3. Bottom Navigation (Mobil)
// 4. Favori Salonlar
// 5. Son Randevularım
// 6. Breadcrumb Navigasyon
// ============================================

const RandevumUX = {
    
    // LocalStorage anahtarları
    STORAGE_KEYS: {
        customerName: 'randevum_customer_name',
        customerPhone: 'randevum_customer_phone',
        favorites: 'randevum_favorites',
        recentAppointments: 'randevum_recent_appointments',
        recentSalons: 'randevum_recent_salons'
    },

    // ==================== 1. TELEFON/İSİM HATIRLA ====================
    
    saveCustomerInfo(name, phone) {
        try {
            if (name) localStorage.setItem(this.STORAGE_KEYS.customerName, name);
            if (phone) localStorage.setItem(this.STORAGE_KEYS.customerPhone, phone);
        } catch (e) {
            console.warn('[UX] LocalStorage hatası:', e);
        }
    },

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

    autoFillCustomerForm() {
        const info = this.getCustomerInfo();
        
        const nameInput = document.getElementById('customerName');
        const phoneInput = document.getElementById('customerPhone');
        
        if (nameInput && info.name && !nameInput.value) {
            nameInput.value = info.name;
        }
        
        if (phoneInput && info.phone && !phoneInput.value) {
            phoneInput.value = this.formatPhoneDisplay(info.phone);
        }
        
        // AI öneri için telefon sakla
        if (info.phone) {
            window.savedCustomerPhone = info.phone;
        }
    },

    formatPhoneDisplay(phone) {
        const clean = phone.replace(/\D/g, '').slice(-10);
        if (clean.length === 10) {
            return `${clean.slice(0,3)} ${clean.slice(3,6)} ${clean.slice(6,8)} ${clean.slice(8)}`;
        }
        return clean;
    },

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
    
    ensureToastContainer() {
        if (document.getElementById('toastContainer')) return;
        
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    },

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
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    },

    success(message, duration) { return this.showToast(message, 'success', duration); },
    error(message, duration) { return this.showToast(message, 'error', duration); },
    warning(message, duration) { return this.showToast(message, 'warning', duration); },
    info(message, duration) { return this.showToast(message, 'info', duration); },

    // ==================== 3. BOTTOM NAVİGATİON ====================
    
    createBottomNav() {
        // Sadece mobilde göster
        if (window.innerWidth > 768) return;
        if (document.getElementById('bottomNav')) return;
        
        const currentPath = window.location.pathname;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        
        const nav = document.createElement('nav');
        nav.id = 'bottomNav';
        nav.className = 'bottom-nav';
        nav.innerHTML = `
            <a href="/" class="bottom-nav-item ${currentPath === '/' ? 'active' : ''}">
                <span class="bottom-nav-icon">🏠</span>
                <span class="bottom-nav-label">Ana Sayfa</span>
            </a>
            <a href="/berber/" class="bottom-nav-item ${currentPath.includes('/berber') && !currentPath.includes('/salon') ? 'active' : ''}">
                <span class="bottom-nav-icon">🔍</span>
                <span class="bottom-nav-label">Ara</span>
            </a>
            <a href="#" onclick="RandevumUX.showMyAppointments(); return false;" class="bottom-nav-item">
                <span class="bottom-nav-icon">📅</span>
                <span class="bottom-nav-label">Randevularım</span>
            </a>
            <a href="#" onclick="RandevumUX.showFavorites(); return false;" class="bottom-nav-item">
                <span class="bottom-nav-icon">❤️</span>
                <span class="bottom-nav-label">Favoriler</span>
            </a>
            ${!isStandalone ? `
            <a href="#" onclick="RandevumUX.showInstallPrompt(); return false;" class="bottom-nav-item" id="bottomNavInstall">
                <span class="bottom-nav-icon">📲</span>
                <span class="bottom-nav-label">Yükle</span>
            </a>
            ` : ''}
        `;
        
        document.body.appendChild(nav);
        document.body.style.paddingBottom = '70px';
    },

    // ==================== 4. FAVORİ SALONLAR ====================
    
    getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.favorites) || '[]');
        } catch (e) {
            return [];
        }
    },

    saveFavorites(favorites) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.favorites, JSON.stringify(favorites));
        } catch (e) {
            console.warn('[UX] Favoriler kaydedilemedi');
        }
    },

    toggleFavorite(salonId, salonName, salonSlug) {
        const favorites = this.getFavorites();
        const index = favorites.findIndex(f => f.id === salonId);
        
        if (index > -1) {
            favorites.splice(index, 1);
            this.success('Favorilerden kaldırıldı');
        } else {
            favorites.unshift({
                id: salonId,
                name: salonName,
                slug: salonSlug,
                addedAt: new Date().toISOString()
            });
            this.success('Favorilere eklendi ❤️');
        }
        
        this.saveFavorites(favorites);
        this.updateFavoriteButton(salonId);
        return index === -1;
    },

    isFavorite(salonId) {
        return this.getFavorites().some(f => f.id === salonId);
    },

    updateFavoriteButton(salonId) {
        const btn = document.getElementById('favoriteBtn');
        if (!btn) return;
        
        const isFav = this.isFavorite(salonId);
        btn.innerHTML = isFav ? '❤️ Favorilerde' : '🤍 Favorilere Ekle';
        btn.classList.toggle('is-favorite', isFav);
    },

    addFavoriteButton(salonId, salonName, salonSlug) {
        // Salon info bölümünü bul
        const salonMeta = document.querySelector('.salon-meta');
        if (!salonMeta || document.getElementById('favoriteBtn')) return;
        
        const isFav = this.isFavorite(salonId);
        
        const btn = document.createElement('button');
        btn.id = 'favoriteBtn';
        btn.className = `favorite-btn ${isFav ? 'is-favorite' : ''}`;
        btn.innerHTML = isFav ? '❤️ Favorilerde' : '🤍 Favorilere Ekle';
        btn.onclick = () => this.toggleFavorite(salonId, salonName, salonSlug);
        
        // Salon meta'dan sonra ekle
        salonMeta.after(btn);
    },

    showFavorites() {
        const favorites = this.getFavorites();
        
        const modal = document.createElement('div');
        modal.className = 'ux-modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        let content = '';
        if (favorites.length === 0) {
            content = `
                <div class="ux-empty-state">
                    <span class="ux-empty-icon">❤️</span>
                    <p>Henüz favori salonunuz yok</p>
                    <a href="/berber/" class="ux-btn-primary">Salon Ara</a>
                </div>
            `;
        } else {
            content = favorites.map(f => `
                <a href="/berber/salon/?slug=${f.slug}" class="ux-list-item">
                    <span class="ux-list-icon">💈</span>
                    <span class="ux-list-text">${f.name}</span>
                    <span class="ux-list-arrow">→</span>
                </a>
            `).join('');
        }
        
        modal.innerHTML = `
            <div class="ux-modal">
                <div class="ux-modal-header">
                    <h3>❤️ Favori Salonlarım</h3>
                    <button class="ux-modal-close" onclick="this.closest('.ux-modal-overlay').remove()">×</button>
                </div>
                <div class="ux-modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    },

    // ==================== 5. SON RANDEVULARIM ====================
    
    getRecentAppointments() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.recentAppointments) || '[]');
        } catch (e) {
            return [];
        }
    },

    saveAppointment(appointment) {
        try {
            const appointments = this.getRecentAppointments();
            
            // Aynı randevu varsa güncelle
            const index = appointments.findIndex(a => 
                a.date === appointment.date && 
                a.time === appointment.time && 
                a.salonId === appointment.salonId
            );
            
            if (index > -1) {
                appointments[index] = appointment;
            } else {
                appointments.unshift(appointment);
            }
            
            // Max 10 randevu tut
            const limited = appointments.slice(0, 10);
            localStorage.setItem(this.STORAGE_KEYS.recentAppointments, JSON.stringify(limited));
        } catch (e) {
            console.warn('[UX] Randevu kaydedilemedi');
        }
    },

    showMyAppointments() {
        const appointments = this.getRecentAppointments();
        
        const modal = document.createElement('div');
        modal.className = 'ux-modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        let content = '';
        if (appointments.length === 0) {
            content = `
                <div class="ux-empty-state">
                    <span class="ux-empty-icon">📅</span>
                    <p>Henüz randevunuz yok</p>
                    <a href="/berber/" class="ux-btn-primary">Randevu Al</a>
                </div>
            `;
        } else {
            const now = new Date();
            content = appointments.map(a => {
                const aptDate = new Date(a.date + 'T' + a.time);
                const isPast = aptDate < now;
                const statusClass = isPast ? 'past' : (a.status === 'confirmed' ? 'confirmed' : 'pending');
                const statusText = isPast ? 'Geçmiş' : (a.status === 'confirmed' ? 'Onaylandı' : 'Bekliyor');
                
                return `
                    <div class="ux-appointment-card ${statusClass}">
                        <div class="ux-apt-header">
                            <span class="ux-apt-salon">💈 ${a.salonName}</span>
                            <span class="ux-apt-status">${statusText}</span>
                        </div>
                        <div class="ux-apt-details">
                            <span>📅 ${this.formatDateShort(a.date)}</span>
                            <span>⏰ ${a.time}</span>
                            <span>✂️ ${a.service}</span>
                        </div>
                        ${!isPast && a.salonSlug ? `<a href="/berber/salon/?slug=${a.salonSlug}" class="ux-apt-link">Salona Git →</a>` : ''}
                    </div>
                `;
            }).join('');
        }
        
        modal.innerHTML = `
            <div class="ux-modal">
                <div class="ux-modal-header">
                    <h3>📅 Randevularım</h3>
                    <button class="ux-modal-close" onclick="this.closest('.ux-modal-overlay').remove()">×</button>
                </div>
                <div class="ux-modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    },

    formatDateShort(dateStr) {
        const d = new Date(dateStr);
        const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        return `${d.getDate()} ${months[d.getMonth()]}`;
    },

    // ==================== 6. BREADCRUMB ====================
    
    createBreadcrumb(items) {
        if (!items || items.length === 0) return;
        if (document.querySelector('.breadcrumb')) return;
        
        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'breadcrumb';
        breadcrumb.setAttribute('aria-label', 'Breadcrumb');
        
        breadcrumb.innerHTML = items.map((item, i) => {
            if (i === items.length - 1) {
                return `<span class="breadcrumb-current">${item.label}</span>`;
            }
            return `<a href="${item.url}" class="breadcrumb-link">${item.label}</a><span class="breadcrumb-sep">›</span>`;
        }).join('');
        
        const header = document.querySelector('header, .header');
        if (header) {
            header.after(breadcrumb);
        }
    },

    autoBreadcrumb() {
        const path = window.location.pathname;
        const items = [{ label: '🏠', url: '/' }];
        
        if (path.includes('/berber/')) {
            items.push({ label: 'Berberler', url: '/berber/' });
            
            if (path.includes('/salon/')) {
                const salonName = document.querySelector('.salon-name, h1')?.textContent?.trim() || 'Salon';
                
                if (path.includes('/yonetim/')) {
                    items.push({ label: salonName, url: path.replace('/yonetim/', '/').split('?')[0] });
                    items.push({ label: 'Yönetim', url: path });
                } else {
                    items.push({ label: salonName, url: path });
                }
            } else if (path.includes('/kayit/')) {
                items.push({ label: 'Salon Ekle', url: path });
            }
        }
        
        if (items.length > 1) {
            this.createBreadcrumb(items);
        }
    },

    // ==================== 7. PWA INSTALL ====================
    
    deferredPrompt: null,
    
    initPWA() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (isStandalone) {
            console.log('[UX] PWA zaten yüklü');
            // Bottom nav'dan yükle butonunu gizle
            const installBtn = document.getElementById('bottomNavInstall');
            if (installBtn) installBtn.style.display = 'none';
            return;
        }
        
        // Global'de yakalanmış prompt var mı?
        if (window.__pwaPrompt) {
            this.deferredPrompt = window.__pwaPrompt;
            console.log('[UX] PWA prompt global\'den alındı');
        }
        
        // Android/Desktop için beforeinstallprompt (henüz yakalanmadıysa)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            window.__pwaPrompt = e;
            console.log('[UX] PWA kuruluma hazır');
            
            // Banner göster (ilk ziyarette)
            const dismissCount = parseInt(localStorage.getItem('pwa-dismiss-count') || '0');
            if (dismissCount < 2) {
                setTimeout(() => this.showPWABanner(), dismissCount === 0 ? 5000 : 10000);
            }
        });
        
        // Yüklendi event'i
        window.addEventListener('appinstalled', () => {
            console.log('[UX] PWA yüklendi!');
            this.success('Uygulama yüklendi! 🎉');
            localStorage.setItem('pwa-dismiss-count', '999');
            this.hidePWABanner();
            this.deferredPrompt = null;
            window.__pwaPrompt = null;
            
            // Bottom nav'dan yükle butonunu kaldır
            const installBtn = document.getElementById('bottomNavInstall');
            if (installBtn) installBtn.style.display = 'none';
        });
    },
    
    showInstallPrompt() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        
        if (isStandalone) {
            this.info('Uygulama zaten yüklü! 📱');
            return;
        }
        
        // Global'den prompt'u al
        const prompt = this.deferredPrompt || window.__pwaPrompt;
        
        if (isIOS) {
            this.showIOSInstallGuide();
        } else if (prompt) {
            prompt.prompt();
            prompt.userChoice.then((result) => {
                if (result.outcome === 'accepted') {
                    localStorage.setItem('pwa-dismiss-count', '999');
                }
                this.deferredPrompt = null;
                window.__pwaPrompt = null;
            });
        } else {
            // Chrome'da beforeinstallprompt henüz tetiklenmediyse
            this.showGenericInstallGuide();
        }
    },
    
    showIOSInstallGuide() {
        const modal = document.createElement('div');
        modal.className = 'ux-modal-overlay';
        modal.id = 'iosInstallModal';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        modal.innerHTML = `
            <div class="ux-modal ios-install-modal">
                <div class="ux-modal-header">
                    <h3>📲 iPhone'a Yükle</h3>
                    <button class="ux-modal-close" onclick="this.closest('.ux-modal-overlay').remove()">×</button>
                </div>
                <div class="ux-modal-body">
                    <div class="ios-install-steps">
                        <div class="ios-step">
                            <div class="ios-step-number">1</div>
                            <div class="ios-step-content">
                                <p>Safari'nin altındaki <strong>Paylaş</strong> butonuna tıklayın</p>
                                <div class="ios-step-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                                        <polyline points="16 6 12 2 8 6"/>
                                        <line x1="12" y1="2" x2="12" y2="15"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="ios-step">
                            <div class="ios-step-number">2</div>
                            <div class="ios-step-content">
                                <p>Aşağı kaydırın ve <strong>"Ana Ekrana Ekle"</strong> seçin</p>
                                <div class="ios-step-icon">➕</div>
                            </div>
                        </div>
                        <div class="ios-step">
                            <div class="ios-step-number">3</div>
                            <div class="ios-step-content">
                                <p>Sağ üstteki <strong>"Ekle"</strong> butonuna tıklayın</p>
                                <div class="ios-step-icon">✓</div>
                            </div>
                        </div>
                    </div>
                    <div class="ios-install-note">
                        <p>💡 Bu işlem sonrasında Randevum ana ekranınızda bir uygulama gibi görünecek!</p>
                    </div>
                    <button class="ux-btn-primary ios-done-btn" onclick="this.closest('.ux-modal-overlay').remove()">Anladım</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    },
    
    showGenericInstallGuide() {
        const modal = document.createElement('div');
        modal.className = 'ux-modal-overlay';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        modal.innerHTML = `
            <div class="ux-modal">
                <div class="ux-modal-header">
                    <h3>📲 Uygulamayı Yükle</h3>
                    <button class="ux-modal-close" onclick="this.closest('.ux-modal-overlay').remove()">×</button>
                </div>
                <div class="ux-modal-body">
                    <div class="generic-install-guide">
                        <p>Tarayıcınızın adres çubuğundaki <strong>yükle simgesine</strong> tıklayın veya menüden <strong>"Uygulamayı yükle"</strong> seçeneğini bulun.</p>
                        <div class="generic-install-img">
                            <span>⋮</span> → <span>📲 Yükle</span>
                        </div>
                    </div>
                    <button class="ux-btn-primary" onclick="this.closest('.ux-modal-overlay').remove()">Tamam</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    },
    
    showPWABanner() {
        if (document.getElementById('uxPwaBanner')) return;
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        const banner = document.createElement('div');
        banner.id = 'uxPwaBanner';
        banner.className = 'ux-pwa-banner';
        banner.innerHTML = `
            <div class="ux-pwa-content">
                <span class="ux-pwa-icon">📲</span>
                <div class="ux-pwa-text">
                    <strong>Randevum'u Yükle</strong>
                    <span>${isIOS ? 'Ana ekrana ekle' : 'Uygulama gibi kullan'}</span>
                </div>
            </div>
            <div class="ux-pwa-actions">
                <button class="ux-pwa-install" onclick="RandevumUX.handleBannerInstall()">Yükle</button>
                <button class="ux-pwa-close" onclick="RandevumUX.dismissPWABanner()">✕</button>
            </div>
        `;
        
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 100);
    },
    
    handleBannerInstall() {
        this.hidePWABanner();
        this.showInstallPrompt();
    },
    
    dismissPWABanner() {
        const count = parseInt(localStorage.getItem('pwa-dismiss-count') || '0');
        localStorage.setItem('pwa-dismiss-count', (count + 1).toString());
        this.hidePWABanner();
    },
    
    hidePWABanner() {
        const banner = document.getElementById('uxPwaBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    },

    // ==================== BAŞLATMA ====================
    
    init() {
        console.log('[UX] Modül v2.0 başlatılıyor...');
        
        // CSS stilleri ekle
        this.injectStyles();
        
        // Toast container
        this.ensureToastContainer();
        
        // Form otomatik doldur
        setTimeout(() => {
            this.autoFillCustomerForm();
            this.addRememberMeCheckbox();
        }, 500);
        
        // Form submit intercept
        this.interceptFormSubmit();
        
        // Bottom navigation (mobil)
        this.createBottomNav();
        
        // Breadcrumb (salon sayfasında)
        setTimeout(() => this.autoBreadcrumb(), 800);
        
        // Salon sayfasındaysa favori butonu ekle
        this.initSalonPage();
        
        // PWA kurulum desteği
        this.initPWA();
        
        // iOS için PWA banner (ilk ziyarette)
        this.checkIOSFirstVisit();
        
        console.log('[UX] Modül hazır ✓');
    },
    
    checkIOSFirstVisit() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.navigator.standalone;
        const dismissCount = parseInt(localStorage.getItem('pwa-dismiss-count') || '0');
        
        if (isIOS && !isStandalone && dismissCount < 2) {
            setTimeout(() => this.showPWABanner(), dismissCount === 0 ? 5000 : 15000);
        }
    },

    initSalonPage() {
        // Salon sayfasında mıyız?
        if (!window.location.pathname.includes('/berber/salon/') || 
            window.location.pathname.includes('/yonetim/')) return;
        
        // Salon yüklendiğinde favori butonu ekle
        const checkSalon = setInterval(() => {
            if (window.salon && window.salon.id) {
                this.addFavoriteButton(window.salon.id, window.salon.name, window.salon.slug);
                clearInterval(checkSalon);
            }
        }, 500);
        
        // 10 saniye sonra dur
        setTimeout(() => clearInterval(checkSalon), 10000);
    },

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
            
            // Randevuyu localStorage'a kaydet
            setTimeout(() => {
                if (window.lastAppointment) {
                    const apt = window.lastAppointment;
                    this.saveAppointment({
                        salonId: apt.salonId,
                        salonName: apt.salonName,
                        salonSlug: window.salon?.slug,
                        date: apt.date,
                        time: apt.time,
                        service: apt.service,
                        status: apt.status || 'pending',
                        createdAt: new Date().toISOString()
                    });
                }
            }, 1000);
        }, true);
    },

    // ==================== CSS STİLLERİ ====================
    
    injectStyles() {
        if (document.getElementById('randevum-ux-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'randevum-ux-styles';
        styles.textContent = `
            /* ========== TOAST ========== */
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
                    bottom: 80px;
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
                .toast { transform: translateY(120%); max-width: 100%; }
            }
            
            .toast.show { transform: translate(0); opacity: 1; }
            
            .toast-icon {
                width: 28px; height: 28px;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 14px; font-weight: bold; flex-shrink: 0;
            }
            
            .toast-success .toast-icon { background: #d1fae5; color: #059669; }
            .toast-error .toast-icon { background: #fee2e2; color: #dc2626; }
            .toast-warning .toast-icon { background: #fef3c7; color: #d97706; }
            .toast-info .toast-icon { background: #e0e7ff; color: #4f46e5; }
            
            .toast-message { flex: 1; font-size: 14px; font-weight: 500; color: #1e293b; }
            .toast-close { background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer; padding: 4px; }
            
            /* ========== BOTTOM NAV ========== */
            .bottom-nav {
                position: fixed;
                bottom: 0; left: 0; right: 0;
                height: 65px;
                background: white;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-around;
                align-items: center;
                z-index: 1000;
                padding-bottom: env(safe-area-inset-bottom);
            }
            
            @media (min-width: 769px) { .bottom-nav { display: none; } }
            
            .bottom-nav-item {
                display: flex; flex-direction: column; align-items: center;
                gap: 4px;
                text-decoration: none;
                color: #64748b;
                font-size: 11px; font-weight: 500;
                padding: 8px 12px;
                border-radius: 12px;
                transition: all 0.2s;
            }
            
            .bottom-nav-item.active { color: #6366f1; }
            .bottom-nav-item:active { background: #f1f5f9; }
            .bottom-nav-icon { font-size: 22px; }
            
            /* ========== FAVORİ BUTONU ========== */
            .favorite-btn {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 10px 16px; margin: 12px 0;
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 14px; font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
            }
            
            .favorite-btn:hover { border-color: #fca5a5; background: #fef2f2; }
            .favorite-btn.is-favorite { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
            
            /* ========== UX MODAL ========== */
            .ux-modal-overlay {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: flex-end; justify-content: center;
                z-index: 9999;
                opacity: 0; visibility: hidden;
                transition: all 0.3s;
            }
            
            @media (min-width: 481px) { .ux-modal-overlay { align-items: center; } }
            .ux-modal-overlay.active { opacity: 1; visibility: visible; }
            
            .ux-modal {
                background: white;
                width: 100%; max-width: 420px; max-height: 80vh;
                border-radius: 20px 20px 0 0;
                overflow: hidden;
                transform: translateY(100%);
                transition: transform 0.3s;
            }
            
            @media (min-width: 481px) { .ux-modal { border-radius: 16px; transform: translateY(20px); } }
            .ux-modal-overlay.active .ux-modal { transform: translateY(0); }
            
            .ux-modal-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 16px 20px;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .ux-modal-header h3 { font-size: 17px; font-weight: 600; margin: 0; }
            .ux-modal-close { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }
            .ux-modal-body { padding: 16px; overflow-y: auto; max-height: calc(80vh - 60px); }
            
            /* ========== EMPTY STATE ========== */
            .ux-empty-state { text-align: center; padding: 40px 20px; }
            .ux-empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }
            .ux-empty-state p { color: #64748b; margin-bottom: 20px; }
            .ux-btn-primary {
                display: inline-block;
                padding: 12px 24px;
                background: #6366f1; color: white;
                text-decoration: none;
                border-radius: 10px; font-weight: 600;
            }
            
            /* ========== LIST ITEM ========== */
            .ux-list-item {
                display: flex; align-items: center; gap: 12px;
                padding: 14px;
                background: #f8fafc;
                border-radius: 12px;
                margin-bottom: 8px;
                text-decoration: none; color: inherit;
                transition: background 0.2s;
            }
            
            .ux-list-item:hover { background: #f1f5f9; }
            .ux-list-icon { font-size: 24px; }
            .ux-list-text { flex: 1; font-weight: 500; }
            .ux-list-arrow { color: #94a3b8; }
            
            /* ========== RANDEVU KARTI ========== */
            .ux-appointment-card {
                background: #f8fafc;
                border-radius: 12px;
                padding: 14px;
                margin-bottom: 10px;
                border-left: 4px solid #6366f1;
            }
            
            .ux-appointment-card.confirmed { border-left-color: #10b981; }
            .ux-appointment-card.past { border-left-color: #94a3b8; opacity: 0.7; }
            
            .ux-apt-header {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 8px;
            }
            
            .ux-apt-salon { font-weight: 600; font-size: 15px; }
            
            .ux-apt-status {
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 6px;
                background: #e0e7ff; color: #4f46e5;
            }
            
            .ux-appointment-card.confirmed .ux-apt-status { background: #d1fae5; color: #059669; }
            .ux-appointment-card.past .ux-apt-status { background: #f1f5f9; color: #64748b; }
            
            .ux-apt-details {
                display: flex; gap: 12px;
                font-size: 13px; color: #64748b;
                flex-wrap: wrap;
            }
            
            .ux-apt-link {
                display: block; margin-top: 10px;
                color: #6366f1;
                font-size: 13px; font-weight: 500;
                text-decoration: none;
            }
            
            /* ========== BREADCRUMB ========== */
            .breadcrumb {
                display: flex; align-items: center; gap: 8px;
                padding: 10px 16px;
                background: #f8fafc;
                font-size: 13px;
                overflow-x: auto;
                white-space: nowrap;
            }
            
            .breadcrumb-link { color: #6366f1; text-decoration: none; }
            .breadcrumb-link:hover { text-decoration: underline; }
            .breadcrumb-sep { color: #cbd5e1; }
            .breadcrumb-current { color: #64748b; }
            
            /* ========== REMEMBER ME ========== */
            .remember-me { margin-top: 8px; }
            .remember-label {
                display: flex; align-items: center; gap: 8px;
                cursor: pointer;
                font-size: 13px; color: #64748b;
            }
            .remember-label input[type="checkbox"] {
                width: 16px; height: 16px;
                accent-color: #6366f1;
            }
            
            /* ========== PWA BANNER ========== */
            .ux-pwa-banner {
                position: fixed;
                bottom: 75px;
                left: 10px;
                right: 10px;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                border-radius: 16px;
                padding: 14px 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                z-index: 9998;
                box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
                transform: translateY(150%);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @media (min-width: 769px) {
                .ux-pwa-banner {
                    bottom: 20px;
                    left: auto;
                    right: 20px;
                    max-width: 360px;
                }
            }
            
            .ux-pwa-banner.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .ux-pwa-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .ux-pwa-icon {
                font-size: 28px;
            }
            
            .ux-pwa-text {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .ux-pwa-text strong {
                font-size: 15px;
            }
            
            .ux-pwa-text span {
                font-size: 12px;
                opacity: 0.9;
            }
            
            .ux-pwa-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .ux-pwa-install {
                background: white;
                color: #6366f1;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                font-family: inherit;
            }
            
            .ux-pwa-close {
                background: rgba(255,255,255,0.2);
                color: white;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* ========== iOS INSTALL GUIDE ========== */
            .ios-install-modal .ux-modal-body {
                padding: 20px;
            }
            
            .ios-install-steps {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin-bottom: 20px;
            }
            
            .ios-step {
                display: flex;
                gap: 14px;
                align-items: flex-start;
            }
            
            .ios-step-number {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 14px;
                flex-shrink: 0;
            }
            
            .ios-step-content {
                flex: 1;
            }
            
            .ios-step-content p {
                margin: 0 0 8px 0;
                font-size: 14px;
                color: #334155;
                line-height: 1.5;
            }
            
            .ios-step-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: #f1f5f9;
                color: #6366f1;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 18px;
            }
            
            .ios-install-note {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 16px;
            }
            
            .ios-install-note p {
                margin: 0;
                font-size: 13px;
                color: #166534;
            }
            
            .ios-done-btn {
                width: 100%;
            }
            
            .generic-install-guide {
                text-align: center;
                padding: 20px 0;
            }
            
            .generic-install-guide p {
                color: #475569;
                margin-bottom: 16px;
                line-height: 1.6;
            }
            
            .generic-install-img {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                font-size: 18px;
                color: #6366f1;
                background: #f1f5f9;
                padding: 16px;
                border-radius: 10px;
                margin-bottom: 20px;
            }
        `;
        
        document.head.appendChild(styles);
    }
};

// Global
window.RandevumUX = RandevumUX;
window.showToast = (msg, type) => RandevumUX.showToast(msg, type);

// PWA: beforeinstallprompt'u HEMEN yakala (modül yüklenmeden önce gelebilir)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__pwaPrompt = e; // Global'de sakla
    console.log('[PWA] Install prompt yakalandı');
});

// Başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RandevumUX.init());
} else {
    RandevumUX.init();
}

console.log('[UX] Modül yüklendi v2.1');
