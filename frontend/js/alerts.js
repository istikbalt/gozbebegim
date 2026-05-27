// Gözbebeğim Custom Premium Alert Modal System
// Dynamically intercepts window.alert with a premium, animated popup matching the platform's HSL aesthetic.

(function() {
  // 1. Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    .custom-alert-overlay {
      position: fixed;
      inset: 0;
      background: rgba(40, 20, 30, 0.4);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .custom-alert-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .custom-alert-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 2.25rem 2rem 2rem 2rem;
      width: 100%;
      max-width: 380px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(212, 83, 126, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(244, 192, 209, 0.4);
      transform: scale(0.9) translateY(20px);
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
    }
    .custom-alert-overlay.open .custom-alert-card {
      transform: scale(1) translateY(0);
    }
    
    /* Elegant soft pink decorative background blobs */
    .custom-alert-card::before {
      content: '';
      position: absolute;
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, rgba(214,83,126,0.06) 0%, rgba(214,83,126,0) 70%);
      top: -50px;
      left: -50px;
      pointer-events: none;
    }
    .custom-alert-card::after {
      content: '';
      position: absolute;
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, rgba(29,158,117,0.04) 0%, rgba(29,158,117,0) 70%);
      bottom: -50px;
      right: -50px;
      pointer-events: none;
    }

    .custom-alert-icon-wrapper {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem auto;
      font-size: 28px;
      position: relative;
      animation: pulseAlert 2s infinite;
    }
    
    .custom-alert-icon-wrapper.success {
      background: #EBFDF5;
      color: #1D9E75;
      border: 1px solid #C2F3DC;
    }
    .custom-alert-icon-wrapper.error {
      background: #FDF2F2;
      color: #E24B4A;
      border: 1px solid #FDE8E8;
    }
    .custom-alert-icon-wrapper.info {
      background: #F0F7FF;
      color: #3B82F6;
      border: 1px solid #DBEAFE;
    }

    @keyframes pulseAlert {
      0% { box-shadow: 0 0 0 0 rgba(212, 83, 126, 0.15); }
      70% { box-shadow: 0 0 0 10px rgba(212, 83, 126, 0); }
      100% { box-shadow: 0 0 0 0 rgba(212, 83, 126, 0); }
    }

    .custom-alert-title {
      font-family: 'Playfair Display', serif;
      font-size: 21px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 0.5rem;
    }
    .custom-alert-message {
      font-family: 'Nunito', sans-serif;
      font-size: 14.5px;
      color: #555555;
      line-height: 1.6;
      margin-bottom: 1.75rem;
      word-break: break-word;
    }
    .custom-alert-btn {
      width: 100%;
      border: none;
      border-radius: 12px;
      padding: 12px;
      font-family: 'Nunito', sans-serif;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }
    
    .custom-alert-btn.success {
      background: linear-gradient(135deg, #D4537E 0%, #B83A64 100%);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(212, 83, 126, 0.25);
    }
    .custom-alert-btn.success:hover {
      background: linear-gradient(135deg, #B83A64 0%, #992F53 100%);
      transform: translateY(-1px);
    }
    
    .custom-alert-btn.error {
      background: linear-gradient(135deg, #E24B4A 0%, #C93534 100%);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(226, 75, 74, 0.25);
    }
    .custom-alert-btn.error:hover {
      background: linear-gradient(135deg, #C93534 0%, #B02322 100%);
      transform: translateY(-1px);
    }

    .custom-alert-btn.info {
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
    }
    .custom-alert-btn.info:hover {
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
      transform: translateY(-1px);
    }

    .custom-alert-btn:active {
      transform: translateY(1px);
    }

    /* Confetti Particle Styles */
    .alert-confetti {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #D4537E;
      border-radius: 50%;
      animation: alertConfettiFall 1.2s ease-out forwards;
      pointer-events: none;
      z-index: 10;
    }
    @keyframes alertConfettiFall {
      0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(250px) rotate(360deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Inject additional styles for the Contact Modal
  const styleContact = document.createElement('style');
  styleContact.textContent = `
    .contact-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(40, 20, 30, 0.45);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .contact-modal-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .contact-modal-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 2rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 40px rgba(212, 83, 126, 0.08);
      border: 1px solid rgba(244, 192, 209, 0.4);
      transform: scale(0.9) translateY(20px);
      transition: transform 0.3s ease;
      position: relative;
      text-align: left;
    }
    .contact-modal-overlay.open .contact-modal-card {
      transform: scale(1) translateY(0);
    }
    .contact-close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 20px;
      color: #999;
      cursor: pointer;
      line-height: 1;
      outline: none;
    }
    .contact-close-btn:hover {
      color: #333;
    }
    .contact-form-group {
      margin-bottom: 12px;
    }
    .contact-form-group label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    .contact-form-group input, .contact-form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 0.5px solid #e8e0e4;
      border-radius: 8px;
      font-size: 13.5px;
      outline: none;
      background: #fafafa;
      transition: all 0.2s;
      font-family: inherit;
    }
    .contact-form-group input:focus, .contact-form-group textarea:focus {
      border-color: #D4537E;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(212, 83, 126, 0.05);
    }
    .contact-submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #D4537E 0%, #B83A64 100%);
      color: white;
      border: none;
      padding: 12px;
      border-radius: 10px;
      font-size: 14.5px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(212, 83, 126, 0.25);
      transition: all 0.2s;
      outline: none;
    }
    .contact-submit-btn:hover {
      background: linear-gradient(135deg, #B83A64 0%, #992F53 100%);
      transform: translateY(-1px);
    }
    .contact-submit-btn:disabled {
      background: #ccc;
      box-shadow: none;
      cursor: not-allowed;
      transform: none;
    }
  `;
  document.head.appendChild(styleContact);

  // 2. Setup DOM Elements for Alert Box
  let overlay, card, iconWrapper, titleEl, messageEl, btnEl;

  function createAlertDOM() {
    if (document.getElementById('customAlertOverlay')) return;

    overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    overlay.id = 'customAlertOverlay';

    card = document.createElement('div');
    card.className = 'custom-alert-card';

    iconWrapper = document.createElement('div');
    iconWrapper.className = 'custom-alert-icon-wrapper';
    
    titleEl = document.createElement('div');
    titleEl.className = 'custom-alert-title';

    messageEl = document.createElement('div');
    messageEl.className = 'custom-alert-message';

    btnEl = document.createElement('button');
    btnEl.className = 'custom-alert-btn';

    card.appendChild(iconWrapper);
    card.appendChild(titleEl);
    card.appendChild(messageEl);
    card.appendChild(btnEl);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Close on button click
    btnEl.addEventListener('click', closeAlert);

    // Close on overlay click (backdrop click)
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closeAlert();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeAlert();
      }
    });
  }

  let activeResolve = null;

  function closeAlert() {
    if (!overlay) return;
    overlay.classList.remove('open');
    if (activeResolve) {
      const tempResolve = activeResolve;
      activeResolve = null;
      tempResolve();
    }
  }

  function launchConfetti() {
    if (!card) return;
    const colors = ['#D4537E', '#1D9E75', '#3B82F6', '#FBBF24', '#A78BFA'];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'alert-confetti';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = Math.random() * 100 + '%';
      p.style.top = '0px';
      p.style.animationDelay = Math.random() * 0.2 + 's';
      p.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
      card.appendChild(p);
      setTimeout(() => p.remove(), 2000);
    }
  }

  // 3. Setup DOM Elements for Contact Modal
  let contactOverlay;

  function createContactDOM() {
    if (document.getElementById('contactModalOverlay')) return;

    contactOverlay = document.createElement('div');
    contactOverlay.className = 'contact-modal-overlay';
    contactOverlay.id = 'contactModalOverlay';

    contactOverlay.innerHTML = `
      <div class="contact-modal-card">
        <button class="contact-close-btn" id="contactCloseBtn">✕</button>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; margin-bottom: 0.5rem; color: #1a1a1a;">📬 İletişim Formu</h3>
        <p style="font-size: 12.5px; color: #666; margin-bottom: 1.25rem; line-height: 1.5;">Bizimle iletişime geçmek, görüşlerinizi iletmek veya teknik destek almak için formu doldurabilirsiniz. 🌸</p>
        
        <div id="contactFormError" style="display: none; background: #FDF2F2; border: 1px solid #FDE8E8; color: #E24B4A; font-size: 12px; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px;"></div>

        <form id="contactFormSubmit">
          <div class="contact-form-group">
            <label>Adınız Soyadınız</label>
            <input type="text" id="contactName" required placeholder="Örn: Ayşe Demir" />
          </div>
          <div class="contact-form-group">
            <label>E-posta Adresiniz</label>
            <input type="email" id="contactEmail" required placeholder="ayse@demir.com" />
          </div>
          <div class="contact-form-group">
            <label>Konu</label>
            <input type="text" id="contactSubject" placeholder="Örn: Teknik Destek / Öneri" />
          </div>
          <div class="contact-form-group" style="margin-bottom: 1.25rem;">
            <label>Mesajınız</label>
            <textarea id="contactMessage" required placeholder="Mesajınızı buraya yazın..." style="min-height: 90px; resize: vertical;"></textarea>
          </div>
          <button type="submit" id="btnSendContact" class="contact-submit-btn">Gönder</button>
        </form>
      </div>
    `;

    document.body.appendChild(contactOverlay);

    // Event listeners
    document.getElementById('contactCloseBtn').addEventListener('click', closeContactModal);
    
    // Close on overlay backdrop click
    contactOverlay.addEventListener('click', function(e) {
      if (e.target === contactOverlay) {
        closeContactModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && contactOverlay.classList.contains('open')) {
        closeContactModal();
      }
    });

    // Handle Form Submit
    document.getElementById('contactFormSubmit').addEventListener('submit', handleContactFormSubmit);
  }

  function openContactModal() {
    createContactDOM();
    document.getElementById('contactFormError').style.display = 'none';
    
    // Pre-fill user data if logged in
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const u = JSON.parse(cachedUser);
        document.getElementById('contactName').value = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        document.getElementById('contactEmail').value = u.email || '';
      } catch (err) {}
    }

    contactOverlay.classList.add('open');
  }

  function closeContactModal() {
    if (contactOverlay) {
      contactOverlay.classList.remove('open');
      document.getElementById('contactFormSubmit').reset();
    }
  }

  function handleContactFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    const errBox = document.getElementById('contactFormError');
    const submitBtn = document.getElementById('btnSendContact');

    errBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Gönderiliyor...';

    fetch('/api/messages/contact-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    })
    .then(res => res.json())
    .then(data => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Gönder';
      if (data.success) {
        closeContactModal();
        alert("Mesajınız başarıyla iletilmiştir! 🌸\nEn kısa sürede e-posta adresiniz üzerinden geri dönüş sağlayacağız.");
      } else {
        errBox.textContent = data.error || 'Mesaj gönderilirken bir hata oluştu.';
        errBox.style.display = 'block';
      }
    })
    .catch(err => {
      console.error("Submit contact error:", err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Gönder';
      errBox.textContent = 'Bağlantı hatası oluştu.';
      errBox.style.display = 'block';
    });
  }

  // 4. Override window.alert
  window.alert = function(message) {
    createAlertDOM();

    // Reset classes
    iconWrapper.className = 'custom-alert-icon-wrapper';
    btnEl.className = 'custom-alert-btn';

    // Normalize message string
    const msgStr = String(message || '');
    
    // Categorize
    const isSuccess = /başarı|tebrik|tıkla|onaylandı|giriş yapıldı|kaydoldu|kayıt|başarılı|gönderildi|güncellendi/i.test(msgStr);
    const isError = /hata|geçersiz|eksik|hatalı|bulunamadı|zorunlu|yanlış|olamaz|başarısız/i.test(msgStr);

    let type = 'info';
    let icon = 'ℹ️';
    let titleText = 'Bilgi';

    if (isSuccess) {
      type = 'success';
      icon = '🎉';
      titleText = 'Harika!';
    } else if (isError) {
      type = 'error';
      icon = '⚠️';
      titleText = 'Bir Sorun Var';
    }

    iconWrapper.classList.add(type);
    iconWrapper.textContent = icon;
    
    titleEl.textContent = titleText;
    messageEl.innerHTML = msgStr.replace(/\n/g, '<br>');
    
    btnEl.classList.add(type);
    btnEl.textContent = 'Tamam';

    overlay.classList.add('open');

    // Confetti on success popup!
    if (type === 'success') {
      setTimeout(launchConfetti, 100);
    }

    // Return a Promise so callers can await if they want to
    return new Promise((resolve) => {
      activeResolve = resolve;
    });
  };

  // 5. Global click listener to hijack mailto:info@gozbebegim.com links and auto-convert Amazon/Trendyol Affiliate URLs
  document.addEventListener('click', function(e) {
    // A. Mailto click hijacker
    const mailLink = e.target.closest('a[href^="mailto:info@gozbebegim.com"]');
    if (mailLink) {
      e.preventDefault();
      openContactModal();
      return;
    }

    // B. Affiliate URL auto-converter
    const affiliateLink = e.target.closest('a[href*="amazon."], a[href*="trendyol.com"]');
    if (affiliateLink) {
      try {
        const href = affiliateLink.getAttribute('href');
        // Parse url
        const url = new URL(href, window.location.origin);
        
        // Amazon: add/replace partner store ID tag
        if (url.hostname.includes('amazon.')) {
          // Use 'gozbebegim-21' as default store ID (feel free to change this in alerts.js!)
          url.searchParams.set('tag', 'gozbebegim-21');
        }
        // Trendyol: add campaign and partner source tracking parameters
        else if (url.hostname.includes('trendyol.com')) {
          url.searchParams.set('utm_source', 'affiliate');
          url.searchParams.set('utm_medium', 'gozbebegim');
          url.searchParams.set('utm_campaign', 'baby_registry');
        }

        // Set the modified href back to the anchor so it navigates with the affiliate tags!
        affiliateLink.setAttribute('href', url.toString());
        console.log(`[Affiliate Converter] Formatted URL: ${url.toString()}`);
      } catch (err) {
        console.error("Affiliate link converter error:", err);
      }
    }
  });

  // Expose methods
  window.openContactModal = openContactModal;
  window.closeContactModal = closeContactModal;

  // 6. DomContentLoaded check
  if (document.body) {
    createAlertDOM();
  } else {
    document.addEventListener('DOMContentLoaded', createAlertDOM);
  }
})();
