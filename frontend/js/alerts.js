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

  // 3. Override window.alert
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

  // 4. DomContentLoaded check
  if (document.body) {
    createAlertDOM();
  } else {
    document.addEventListener('DOMContentLoaded', createAlertDOM);
  }
})();
