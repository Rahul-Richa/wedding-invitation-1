/**
 * ROSE GOLD BLUSH ROYAL — WEDDING INVITATION SCRIPTS
 * Couple: Richa & Rahul
 * Wedding Date: Saturday, November 21, 2026, 4:30 PM
 *
 * Comprehensive interactivity:
 * - HTML5 Canvas Scratch-to-Reveal with touch/mouse support
 * - Live dynamic countdown timer
 * - Google Calendar and iCal (.ics) generators
 * - RSVP form validation & localStorage persistence
 * - Floating royal hearts ambient effect
 * - Web Audio API ambient romantic harp synth
 * - Booking code clipboard copy & toast notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  // Wedding Target Date: Saturday, November 21, 2026, 18:30:00 (6:30 PM Local Time)
  const WEDDING_DATE = new Date('2026-11-21T18:30:00');

  // Shared Web Audio Context for Chimes and Melodies
  let audioCtx = null;
  function getAudioContext() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  /* ==========================================================================
     0. FULL-SCREEN INTERACTIVE INTRO VIDEO GATE
     ========================================================================== */
  const videoIntroOverlay = document.getElementById('videoIntroOverlay');
  const introVideo = document.getElementById('introVideo');
  let isIntroClosed = !videoIntroOverlay;
  let isVideoStarted = false;

  if (videoIntroOverlay && introVideo) {
    // Lock page scrolling while intro overlay is active
    document.body.classList.add('intro-active');
    document.body.style.overflow = 'hidden';

    // Function to gracefully close overlay and reveal website
    function closeIntroVideo() {
      if (isIntroClosed) return;
      isIntroClosed = true;

      // Start 0.8s CSS transition fade out
      videoIntroOverlay.classList.add('fade-out');

      setTimeout(() => {
        videoIntroOverlay.style.display = 'none';
        videoIntroOverlay.style.pointerEvents = 'none';
        document.body.classList.remove('intro-active');
        document.body.style.overflow = 'auto';

        // Pause video to ensure audio / processing stops
        try {
          introVideo.pause();
        } catch (err) {}

        // Automatically start background music when intro video completes
        startBackgroundMusic();
      }, 800);
    }

    // Tap/Click anywhere on screen to start video and song immediately
    function handleOverlayTap() {
      if (isIntroClosed) return;

      // Start playing video
      if (!isVideoStarted || introVideo.paused) {
        isVideoStarted = true;

        introVideo.muted = true;
        const playPromise = introVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Playback error or gesture requirement:', err);
            introVideo.play().catch(() => {});
          });
        }
      }

      // Start song immediately from this exact click
      startBackgroundMusic();
    }

    // Click / Touch listener on overlay
    videoIntroOverlay.addEventListener('click', handleOverlayTap);

    // Listen for video completion: smoothly reveal website
    introVideo.addEventListener('ended', closeIntroVideo);

    // Video error fallback: if network fails or video cannot load, tap reveals website
    introVideo.addEventListener('error', () => {
      console.warn('Video failed to load, tap reveals website');
      videoIntroOverlay.addEventListener('click', closeIntroVideo, { once: true });
    });
  }

  /* ==========================================================================
     1. SCRATCH TO REVEAL CANVAS LOGIC
     ========================================================================== */
  const canvas = document.getElementById('scratchCanvas');
  const revealAllBtn = document.getElementById('revealAllBtn');
  let isRevealed = false;

  if (canvas) {
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Adjust canvas resolution for sharp retina display
    function initCanvasFoil() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Create Rose Gold Shimmer Metallic Gradient
      const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      grad.addColorStop(0, '#E8B4A2');
      grad.addColorStop(0.25, '#ECC4B2');
      grad.addColorStop(0.5, '#D49A89');
      grad.addColorStop(0.75, '#C27664');
      grad.addColorStop(1, '#B76E79');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Add subtle sparkling pattern / stars over foil
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 45; i++) {
        const sx = Math.random() * rect.width;
        const sy = Math.random() * rect.height;
        const sr = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add elegant inner border line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(12, 12, rect.width - 24, rect.height - 24);

      // Decorative Foil Text
      const isNarrow = rect.width < 390;
      ctx.font = isNarrow ? '600 11px Montserrat, sans-serif' : '600 13px Montserrat, sans-serif';
      ctx.fillStyle = '#4A1B28';
      ctx.textAlign = 'center';
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = isNarrow ? '2px' : '3px';
      }
      ctx.fillText('✦ THE WEDDING RECEPTION ✦', rect.width / 2, rect.height / 2 - 32);

      ctx.font = isNarrow ? '700 19px "Playfair Display", Georgia, serif' : '700 22px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#2B1117';
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = '0px';
      }
      ctx.fillText('Scratch to Reveal Date', rect.width / 2, rect.height / 2 + 4);

      ctx.font = isNarrow ? 'italic 12.5px "Cormorant Garamond", Georgia, serif' : 'italic 14px "Cormorant Garamond", Georgia, serif';
      ctx.fillStyle = '#5A2633';
      ctx.fillText('Use your finger or mouse to unveil the moment', rect.width / 2, rect.height / 2 + 34);

      ctx.font = '18px sans-serif';
      ctx.fillText('✨  💖  ✨', rect.width / 2, rect.height / 2 + 68);
    }

    // Call init initially and on window resize
    initCanvasFoil();
    window.addEventListener('resize', () => {
      if (!isRevealed) {
        initCanvasFoil();
      }
    });

    // Helper: Get coordinate relative to canvas
    function getCanvasCoordinates(e) {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    // Scratching stroke
    function scratch(e) {
      if (!isDrawing || isRevealed) return;
      e.preventDefault();

      const { x, y } = getCanvasCoordinates(e);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 42;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      lastX = x;
      lastY = y;

      checkRevealPercentage();
    }

    // Measure how much foil has been scratched
    let checkThrottle = false;
    function checkRevealPercentage() {
      if (checkThrottle || isRevealed) return;
      checkThrottle = true;

      setTimeout(() => {
        checkThrottle = false;
        try {
          const rect = canvas.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          const w = Math.floor(rect.width * dpr);
          const h = Math.floor(rect.height * dpr);
          const sampleStride = 8;
          const imgData = ctx.getImageData(0, 0, w, h);
          const pixels = imgData.data;
          let transparentCount = 0;
          let totalSampled = 0;

          for (let i = 3; i < pixels.length; i += 4 * sampleStride) {
            totalSampled++;
            if (pixels[i] < 128) {
              transparentCount++;
            }
          }

          const scratchedPercent = (transparentCount / totalSampled) * 100;
          if (scratchedPercent > 40) {
            revealFully();
          }
        } catch (err) {
          // Fallback if canvas security restriction occurs
        }
      }, 100);
    }

    function revealFully() {
      if (isRevealed) return;
      isRevealed = true;
      canvas.style.opacity = '0';
      setTimeout(() => {
        canvas.style.display = 'none';
      }, 500);

      // Trigger Grand Unique Celebration Animation
      triggerRevealCelebration();

      showToast('Wedding Reception Date Unveiled! Saturday, November 21, 2026 ✨');
      if (revealAllBtn) {
        revealAllBtn.innerHTML = '<i class="fa-solid fa-sparkles"></i> Date Revealed with Love 💖';
        revealAllBtn.classList.add('is-revealed-active');
        revealAllBtn.disabled = true;
      }
      const hint = document.querySelector('.scratch-hint');
      if (hint) {
        hint.style.opacity = '0';
        setTimeout(() => { hint.style.display = 'none'; }, 400);
      }
    }

    /* Unique Celebration Animation with Particles and Royal Chimes */
    function triggerRevealCelebration() {
      const card = document.getElementById('scratchCard');
      if (!card) return;

      // Add unique celebratory animation class to card
      card.classList.add('is-unveiled-celebration');

      // Play soft celestial ascending chime
      playCelebrationChime();

      // Confetti & Sparkles Fireworks Burst
      const rect = card.getBoundingClientRect();
      const particleContainer = document.createElement('div');
      particleContainer.className = 'reveal-particle-canvas';
      document.body.appendChild(particleContainer);

      const symbols = ['✦', '✧', '✨', '💖', '♥', '🌸', '★'];
      const colors = ['#B76E79', '#D49A89', '#ECC4B2', '#E8B4A2', '#C27664', '#F5DCD0', '#FFD1DC'];
      const particleCount = 52;

      // Center of card coordinates in viewport
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'reveal-sparkle-particle';
        const isSymbol = Math.random() > 0.4;

        if (isSymbol) {
          particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
          particle.style.fontSize = (Math.random() * 14 + 14) + 'px';
        } else {
          particle.classList.add('petal-particle');
          const size = Math.random() * 8 + 6;
          particle.style.width = size + 'px';
          particle.style.height = (size * 1.4) + 'px';
          particle.style.borderRadius = '50% 0 50% 50%';
        }

        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.color = color;
        particle.style.backgroundColor = isSymbol ? 'transparent' : color;
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 180 + 90;
        const destX = Math.cos(angle) * distance;
        const destY = Math.sin(angle) * distance + (Math.random() * 60 + 20);
        const rot = (Math.random() - 0.5) * 720;
        const duration = Math.random() * 0.8 + 1.8;

        particle.style.setProperty('--dest-x', `${destX}px`);
        particle.style.setProperty('--dest-y', `${destY}px`);
        particle.style.setProperty('--dest-rot', `${rot}deg`);
        particle.style.animation = `revealParticleBurst ${duration}s cubic-bezier(0.25, 1, 0.5, 1) forwards`;

        particleContainer.appendChild(particle);
      }

      setTimeout(() => {
        if (particleContainer.parentNode) {
          particleContainer.parentNode.removeChild(particleContainer);
        }
      }, 3000);
    }

    function playCelebrationChime() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            try {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, ctx.currentTime);

              gain.gain.setValueAtTime(0.001, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.04);
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

              osc.connect(gain);
              gain.connect(ctx.destination);

              osc.start();
              osc.stop(ctx.currentTime + 1.9);
            } catch (e) {}
          }, idx * 130);
        });
      } catch (e) {}
    }

    // Event Listeners for Mouse
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const { x, y } = getCanvasCoordinates(e);
      lastX = x;
      lastY = y;
      scratch(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDrawing) scratch(e);
    });
    window.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    // Event Listeners for Touch
    canvas.addEventListener('touchstart', (e) => {
      isDrawing = true;
      const { x, y } = getCanvasCoordinates(e);
      lastX = x;
      lastY = y;
      scratch(e);
    }, { passive: false });
    window.addEventListener('touchmove', (e) => {
      if (isDrawing) scratch(e);
    }, { passive: false });
    window.addEventListener('touchend', () => {
      isDrawing = false;
    });
    window.addEventListener('touchcancel', () => {
      isDrawing = false;
    });

    // Instant Reveal Button
    if (revealAllBtn) {
      revealAllBtn.addEventListener('click', () => {
        revealFully();
      });
    }
  }

  /* ==========================================================================
     2. SAVE THE DATE CALENDAR DROPDOWN COMPONENT (5 Options)
     ========================================================================== */
  const saveTheDateToggleBtn = document.getElementById('saveTheDateToggleBtn');
  const calendarDropdownCard = document.getElementById('calendarDropdownCard');
  const revealedDateCrest = document.getElementById('revealedDateCrest');

  const calOptGoogle = document.getElementById('calOptGoogle');
  const calOptOutlook = document.getElementById('calOptOutlook');
  const calOptYahoo = document.getElementById('calOptYahoo');
  const calOptApple = document.getElementById('calOptApple');
  const calOptIcs = document.getElementById('calOptIcs');

  const calTitle = 'Richa & Rahul Wedding Reception';
  const calDesc = 'Join us to celebrate the wedding reception of Richa and Rahul at Baig Farms & Resort (Zootopia), Godhani (Railway), Maharashtra.';
  const calLocation = 'Baig Farms & Resort (Zootopia), Pithasur Plot no 29, Pithesur, Godhani (Railway), Maharashtra 441501';
  const calStart = '20261121T183000';
  const calEnd = '20261122T000000';

  // 1. Google Calendar
  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calTitle)}&dates=${calStart}/${calEnd}&ctz=Asia/Kolkata&details=${encodeURIComponent(calDesc)}&location=${encodeURIComponent(calLocation)}`;
  if (calOptGoogle) calOptGoogle.href = gCalUrl;

  // 2. Office 365 / Outlook
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&subject=${encodeURIComponent(calTitle)}&startdt=2026-11-21T18:30:00%2B05:30&enddt=2026-11-22T00:00:00%2B05:30&body=${encodeURIComponent(calDesc)}&location=${encodeURIComponent(calLocation)}`;
  if (calOptOutlook) calOptOutlook.href = outlookUrl;

  // 3. Yahoo Calendar (UTC times: 18:30 IST is 13:00 UTC)
  const yahooUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(calTitle)}&st=20261121T130000Z&et=20261121T183000Z&desc=${encodeURIComponent(calDesc)}&in_loc=${encodeURIComponent(calLocation)}`;
  if (calOptYahoo) calOptYahoo.href = yahooUrl;

  // 4 & 5. iCal / Apple Calendar Generator
  function downloadIcsFile() {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Richa & Rahul Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:royal-wedding-richa-rahul-2026@wedding.invitation',
      'SUMMARY:' + calTitle,
      'DESCRIPTION:' + calDesc,
      'LOCATION:' + calLocation,
      'DTSTART;TZID=Asia/Kolkata:20261121T183000',
      'DTEND;TZID=Asia/Kolkata:20261122T000000',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Richa-and-Rahul-Wedding.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Calendar event (.ics) ready! Open to save in your phone or laptop calendar 📅');
  }

  if (calOptApple) {
    calOptApple.addEventListener('click', (e) => {
      e.preventDefault();
      downloadIcsFile();
    });
  }

  if (calOptIcs) {
    calOptIcs.addEventListener('click', (e) => {
      e.preventDefault();
      downloadIcsFile();
    });
  }

  // Toggle dropdown on clicking "SAVE THE DATE" button
  if (saveTheDateToggleBtn && calendarDropdownCard) {
    saveTheDateToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      calendarDropdownCard.classList.toggle('is-collapsed');
      const isExpanded = !calendarDropdownCard.classList.contains('is-collapsed');
      saveTheDateToggleBtn.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Clicking the date crest also toggles or focuses the calendar options
  if (revealedDateCrest && calendarDropdownCard) {
    revealedDateCrest.addEventListener('click', () => {
      calendarDropdownCard.classList.remove('is-collapsed');
      if (saveTheDateToggleBtn) saveTheDateToggleBtn.setAttribute('aria-expanded', 'true');
      showToast('Select your preferred calendar below 📅');
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (calendarDropdownCard && !calendarDropdownCard.classList.contains('is-collapsed')) {
      if (!calendarDropdownCard.contains(e.target) && !saveTheDateToggleBtn.contains(e.target)) {
        calendarDropdownCard.classList.add('is-collapsed');
        if (saveTheDateToggleBtn) saveTheDateToggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  /* ==========================================================================
     3. LIVE COUNTDOWN TIMER
     ========================================================================== */
  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minutesEl = document.getElementById('cdMinutes');
  const secondsEl = document.getElementById('cdSeconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = WEDDING_DATE.getTime() - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ==========================================================================
     4. BOOKING CODE CLIPBOARD COPY
     ========================================================================== */
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const promoCodeVal = document.getElementById('promoCodeVal');

  if (copyCodeBtn && promoCodeVal) {
    copyCodeBtn.addEventListener('click', () => {
      const codeText = promoCodeVal.textContent.trim();
      navigator.clipboard.writeText(codeText).then(() => {
        copyCodeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        showToast(`Promo code "${codeText}" copied to clipboard!`);
        setTimeout(() => {
          copyCodeBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
        }, 3000);
      }).catch(() => {
        showToast(`Promo code: ${codeText}`);
      });
    });
  }

  /* ==========================================================================
     5. RSVP FORM VALIDATION & PERSISTENCE
     ========================================================================== */
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpSuccessCard = document.getElementById('rsvpSuccessCard');
  const submittedDetailsBox = document.getElementById('submittedDetailsBox');
  const resetRsvpBtn = document.getElementById('resetRsvpBtn');

  // Load existing submission if previously submitted
  const savedRsvp = localStorage.getItem('wedding_rsvp_richa_rahul') || localStorage.getItem('wedding_rsvp_rahul_richa');
  if (savedRsvp) {
    try {
      const data = JSON.parse(savedRsvp);
      displaySuccessState(data);
    } catch (e) {}
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName');
      const emailAddress = document.getElementById('emailAddress');
      const attendanceStatus = document.getElementById('attendanceStatus');
      const guestCount = document.getElementById('guestCount');
      const dietaryPreferences = document.getElementById('dietaryPreferences');
      const messageBox = document.getElementById('messageBox');

      // Clear previous error messages
      document.getElementById('fullNameError').textContent = '';
      document.getElementById('emailAddressError').textContent = '';
      document.getElementById('attendanceStatusError').textContent = '';

      let isValid = true;

      // Validate Name
      if (!fullName.value.trim()) {
        document.getElementById('fullNameError').textContent = 'Please provide your full name.';
        isValid = false;
      }

      // Validate Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailAddress.value.trim()) {
        document.getElementById('emailAddressError').textContent = 'Please provide your email address.';
        isValid = false;
      } else if (!emailPattern.test(emailAddress.value.trim())) {
        document.getElementById('emailAddressError').textContent = 'Please enter a valid email address.';
        isValid = false;
      }

      // Validate Attendance
      if (!attendanceStatus.value) {
        document.getElementById('attendanceStatusError').textContent = 'Please select whether you will attend.';
        isValid = false;
      }

      if (!isValid) return;

      const submissionData = {
        name: fullName.value.trim(),
        email: emailAddress.value.trim(),
        attendance: attendanceStatus.value,
        guests: guestCount.value,
        dietary: dietaryPreferences.value.trim() || 'None specified',
        message: messageBox.value.trim() || 'No personal note',
        timestamp: new Date().toLocaleString()
      };

      // Store in localStorage
      localStorage.setItem('wedding_rsvp_richa_rahul', JSON.stringify(submissionData));

      // Display success
      displaySuccessState(submissionData);
      showToast('RSVP sent successfully! Thank you!');
    });
  }

  function displaySuccessState(data) {
    if (!rsvpForm || !rsvpSuccessCard) return;

    rsvpForm.classList.add('hidden');
    rsvpSuccessCard.classList.remove('hidden');

    let statusText = 'Attending (Yes)';
    if (data.attendance === 'no') {
      statusText = 'Not Attending (No)';
    } else {
      statusText = 'Attending (Yes)';
    }

    submittedDetailsBox.innerHTML = `
      <div><strong>Guest Name:</strong> ${escapeHtml(data.name)}</div>
      <div><strong>Email:</strong> ${escapeHtml(data.email)}</div>
      <div><strong>Status:</strong> ${escapeHtml(statusText)}</div>
      <div><strong>Party Size:</strong> ${escapeHtml(data.guests)} Guest(s)</div>
      <div><strong>Dietary Preference:</strong> ${escapeHtml(data.dietary)}</div>
      ${data.message !== 'No personal note' ? `<div><strong>Your Wishes:</strong> "<em>${escapeHtml(data.message)}</em>"</div>` : ''}
    `;
  }

  if (resetRsvpBtn) {
    resetRsvpBtn.addEventListener('click', () => {
      localStorage.removeItem('wedding_rsvp_richa_rahul');
      localStorage.removeItem('wedding_rsvp_rahul_richa');
      rsvpForm.reset();
      rsvpSuccessCard.classList.add('hidden');
      rsvpForm.classList.remove('hidden');
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  /* ==========================================================================
     6. AMBIENT FLOATING HEARTS EFFECT
     ========================================================================== */
  const heartsContainer = document.getElementById('heartsContainer');
  const heartsToggleBtn = document.getElementById('heartsToggleBtn');
  let heartsActive = true;
  let heartInterval = null;

  // Curated romantic palette for hearts: rose gold, blush, soft coral, champagne
  const heartColors = ['#E89CA9', '#B76E79', '#ECC4B2', '#D49A89', '#F2B1BC', '#E07A8A'];

  function createHeart() {
    if (!heartsActive || !heartsContainer) return;

    const heart = document.createElement('div');
    heart.classList.add('heart-particle');

    // Randomize heart size and appearance
    const size = Math.floor(Math.random() * 16 + 14); // 14px to 30px
    const color = heartColors[Math.floor(Math.random() * heartColors.length)];
    const duration = (Math.random() * 4 + 7).toFixed(1); // 7s to 11s
    const leftPos = (Math.random() * 96 + 2).toFixed(1); // 2vw to 98vw
    const drift = (Math.random() * 60 - 30).toFixed(0); // slight left/right drift

    heart.innerHTML = '<i class="fa-solid fa-heart"></i>';
    heart.style.fontSize = `${size}px`;
    heart.style.color = color;
    heart.style.left = `${leftPos}vw`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.setProperty('--drift', `${drift}px`);

    heartsContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, parseFloat(duration) * 1000 + 1000);
  }

  function startHearts() {
    if (heartInterval) clearInterval(heartInterval);
    heartInterval = setInterval(createHeart, 500);
  }

  startHearts();

  if (heartsToggleBtn) {
    heartsToggleBtn.addEventListener('click', () => {
      heartsActive = !heartsActive;
      if (heartsActive) {
        heartsToggleBtn.classList.remove('active');
        startHearts();
        showToast('Floating hearts enabled 💖');
      } else {
        heartsToggleBtn.classList.add('active');
        clearInterval(heartInterval);
        if (heartsContainer) heartsContainer.innerHTML = '';
        showToast('Floating hearts paused');
      }
    });
  }

  /* ==========================================================================
     7. ROMANTIC BACKGROUND MUSIC (MP3 PLAYER & CONTROLS)
     ========================================================================== */
  const bgMusic = document.getElementById('bgMusic');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  let isPlayingMusic = false;
  let userManuallyPaused = false;

  function updateMusicButtonState(playing) {
    isPlayingMusic = playing;
    if (!musicToggleBtn) return;
    if (playing) {
      musicToggleBtn.classList.add('active');
      musicToggleBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span class="btn-label">Pause</span>';
    } else {
      musicToggleBtn.classList.remove('active');
      musicToggleBtn.innerHTML = '<i class="fa-solid fa-music"></i> <span class="btn-label">Music</span>';
    }
  }

  function startBackgroundMusic() {
    if (!bgMusic || userManuallyPaused) return;
    if (!bgMusic.paused) return; // Already playing smoothly
    bgMusic.volume = 0.55;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          updateMusicButtonState(true);
        })
        .catch((err) => {
          console.warn('Background music autoplay awaiting user gesture:', err);
          updateMusicButtonState(false);
        });
    }
  }

  function pauseBackgroundMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    updateMusicButtonState(false);
  }

  if (musicToggleBtn && bgMusic) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (bgMusic.paused) {
        userManuallyPaused = false;
        startBackgroundMusic();
        showToast('Playing Romantic Background Music');
      } else {
        userManuallyPaused = true;
        pauseBackgroundMusic();
        showToast('Music paused');
      }
    });

    bgMusic.addEventListener('play', () => updateMusicButtonState(true));
    bgMusic.addEventListener('pause', () => updateMusicButtonState(false));

    // Global listener: Start song on first touch/click anywhere on page
    const triggerAudioOnFirstGesture = () => {
      if (bgMusic && bgMusic.paused && !userManuallyPaused) {
        startBackgroundMusic();
      }
    };
    document.addEventListener('click', triggerAudioOnFirstGesture, { passive: true });
    document.addEventListener('touchstart', triggerAudioOnFirstGesture, { passive: true });
  }

  /* ==========================================================================
     8. TOAST NOTIFICATION HELPER
     ========================================================================== */
  const toastNotification = document.getElementById('toastNotification');
  let toastTimer = null;

  function showToast(msg) {
    if (!toastNotification) return;
    toastNotification.textContent = msg;
    toastNotification.classList.remove('hidden');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 4000);
  }

  /* ==========================================================================
     9. SCROLL REVEAL ANIMATIONS OBSERVER
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-fade, .reveal-left, .reveal-right');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  /* ==========================================================================
     10. PROGRAM TIMELINE: DYNAMIC PROGRESS & MAGICAL CELEBRATION EFFECTS
     ========================================================================== */
  initProgramTimeline();

  function initProgramTimeline() {
    const timelineContainer = document.querySelector('.timeline-container');
    const spineFill = document.querySelector('.timeline-spine-fill');
    const spineHead = document.querySelector('.timeline-spine-head');
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (!timelineContainer) return;

    let isTicking = false;

    function handleTimelineScroll() {
      if (!isTicking) {
        requestAnimationFrame(() => {
          const rect = timelineContainer.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Start filling when container enters ~72% of viewport
          const triggerPoint = windowHeight * 0.72;
          const containerHeight = rect.height;
          const currentDistance = triggerPoint - rect.top;

          let progress = currentDistance / containerHeight;
          progress = Math.max(0, Math.min(1, progress));

          if (spineFill) {
            spineFill.style.height = `${(progress * 100).toFixed(1)}%`;
          }

          if (spineHead) {
            spineHead.style.top = `${(progress * 100).toFixed(1)}%`;
            spineHead.style.opacity = progress > 0.015 ? '1' : '0';
          }

          // Activate milestones as the beam flows across them
          timelineItems.forEach(item => {
            const marker = item.querySelector('.timeline-marker');
            if (marker) {
              const markerRect = marker.getBoundingClientRect();
              if (markerRect.top <= triggerPoint + 15) {
                if (!item.classList.contains('timeline-active')) {
                  item.classList.add('timeline-active');
                }
              } else {
                item.classList.remove('timeline-active');
              }
            }
          });

          isTicking = false;
        });
        isTicking = true;
      }
    }

    window.addEventListener('scroll', handleTimelineScroll, { passive: true });
    window.addEventListener('resize', handleTimelineScroll, { passive: true });
    // Initial evaluation
    handleTimelineScroll();

    // Tap/Click surprise celebration on timeline cards
    timelineItems.forEach(item => {
      const card = item.querySelector('.timeline-card');
      if (!card) return;

      const triggerCardSurprise = (e) => {
        // Bounce card
        card.classList.remove('card-surprise-pulse');
        void card.offsetWidth; // trigger reflow
        card.classList.add('card-surprise-pulse');

        // Sparkle burst from event coordinates
        const rect = card.getBoundingClientRect();
        let clientX = rect.left + rect.width / 2;
        let clientY = rect.top + rect.height / 2;

        if (e && e.clientX && e.clientY) {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        createTimelineCardSparkles(clientX, clientY);

        // Toast feedback with romantic & celebratory wording
        const time = item.getAttribute('data-event-time') || card.querySelector('.timeline-time')?.innerText.trim() || '';
        const title = item.getAttribute('data-event-title') || card.querySelector('.timeline-title')?.innerText.trim() || 'Milestone';
        
        showToast(`✨ ${time ? time + ' — ' : ''}${title} 💖`);
      };

      card.addEventListener('click', triggerCardSurprise);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerCardSurprise();
        }
      });
    });
  }

  function createTimelineCardSparkles(x, y) {
    const container = document.createElement('div');
    container.className = 'timeline-sparkle-canvas';
    document.body.appendChild(container);

    const symbols = ['✦', '✧', '✨', '💖', '★', '💍', '🌸', '❦'];
    const colors = ['#D4AF37', '#B76E79', '#ECC4B2', '#FFD1DC', '#E8959F', '#FFF0F2'];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('span');
      p.className = 'timeline-click-sparkle';
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.color = colors[Math.floor(Math.random() * colors.length)];
      p.style.fontSize = `${Math.floor(Math.random() * 10 + 12)}px`;
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;

      const angle = (Math.PI * 2 / particleCount) * i + (Math.random() - 0.5) * 0.5;
      const dist = Math.random() * 90 + 55;
      const destX = Math.cos(angle) * dist;
      const destY = Math.sin(angle) * dist - 25; // gentle upward float
      const rot = (Math.random() - 0.5) * 360;
      const dur = Math.random() * 0.4 + 0.9;

      p.style.setProperty('--tx', `${destX}px`);
      p.style.setProperty('--ty', `${destY}px`);
      p.style.setProperty('--tr', `${rot}deg`);
      p.style.animation = `timelineSparkleFly ${dur}s cubic-bezier(0.22, 1, 0.36, 1) forwards`;

      container.appendChild(p);
    }

    setTimeout(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, 1500);
  }
});
