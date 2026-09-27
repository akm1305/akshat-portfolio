/* ==========================================================================
   PORTFOLIO INTERACTION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Initialize AOS (Animate On Scroll)
  AOS.init({
    duration: 800,
    easing: 'ease-out-quad',
    once: true,
    mirror: false
  });

  /* ==========================================================================
     NAVBAR SCROLL EFFECT & MOBILE DRAWER
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Sticky Navbar background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile drawer toggle
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('open');
    mobileDrawer.classList.toggle('open');
  });

  // Close mobile drawer when clicking a link
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('open');
      mobileDrawer.classList.remove('open');
    });
  });

  // Close drawer if screen scales up beyond tablet width
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mobileMenuToggle.classList.remove('open');
      mobileDrawer.classList.remove('open');
    }
  });


  /* ==========================================================================
     DYNAMIC TYPING ANIMATION (HERO)
     ========================================================================== */
  const typingTextElement = document.getElementById('typing-text');
  const words = ["Data Analyst", "BI Developer", "Analytics Associate", "BCA Data Science Student"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeEffect() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      // Remove characters
      typingTextElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Deleting is faster
    } else {
      // Add characters
      typingTextElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }

    // Determine state changes
    if (!isDeleting && charIndex === currentWord.length) {
      // Pause at full word
      isDeleting = true;
      typingSpeed = 1500; // Pause duration at end of word
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(typeEffect, typingSpeed);
  }

  // Start typing
  if (typingTextElement) {
    typeEffect();
  }


  /* ==========================================================================
     ACTIVE SECTION LINK HIGHLIGHTING
     ========================================================================== */
  const sections = document.querySelectorAll('section[id], header');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserverOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px', // Trigger when section occupies the main viewport area
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => navObserver.observe(section));


  /* ==========================================================================
     SCROLL TRIGGERED STATS COUNTER
     ========================================================================== */
  const statsSection = document.querySelector('.about-stats-grid');
  const statNumbers = document.querySelectorAll('.stat-number');
  let countersAnimated = false;

  function animateCounters() {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      let count = 0;
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // ~60fps
      
      const updateCount = () => {
        count += increment;
        if (count < target) {
          stat.textContent = Math.floor(count) + (target > 3 ? '+' : '');
          requestAnimationFrame(updateCount);
        } else {
          stat.textContent = target + (target > 3 ? '+' : '');
        }
      };
      
      updateCount();
    });
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersAnimated) {
        animateCounters();
        countersAnimated = true;
      }
    });
  }, { threshold: 0.3 });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }


  /* ==========================================================================
     SCROLL TRIGGERED SKILL BARS
     ========================================================================== */
  const skillsSection = document.querySelector('.skills-section');
  const progressFills = document.querySelectorAll('.progress-bar-fill');
  let skillsAnimated = false;

  function animateSkillBars() {
    progressFills.forEach(fill => {
      const targetProgress = fill.getAttribute('data-progress');
      fill.style.width = targetProgress;
    });
  }

  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !skillsAnimated) {
        animateSkillBars();
        skillsAnimated = true;
      }
    });
  }, { threshold: 0.1 });

  if (skillsSection) {
    skillsObserver.observe(skillsSection);
  }


  /* ==========================================================================
     PROJECT FILTERS
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        // Custom animated show/hide
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hide');
          // Trigger slight scale in
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.classList.add('hide');
        }
      });
    });
  });


  /* ==========================================================================
     UNIVERSAL MODAL OVERLAY (Live Demos & Blog details)
     ========================================================================== */
  const customModal = document.getElementById('custom-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalContentArea = document.getElementById('modal-content-area');

  let activeChartInstance = null;
  let activeDemoTimeouts = [];

  function destroyActiveDemo() {
    if (activeChartInstance) {
      activeChartInstance.destroy();
      activeChartInstance = null;
    }
    activeDemoTimeouts.forEach(t => clearTimeout(t));
    activeDemoTimeouts = [];
  }

  function openModal(contentHtml, projectKey = null) {
    destroyActiveDemo();
    modalContentArea.innerHTML = contentHtml;
    customModal.classList.add('open');
    document.body.style.overflow = 'hidden'; // Stop background scroll

    if (projectKey && projectInitializers[projectKey]) {
      setTimeout(() => {
        projectInitializers[projectKey]();
      }, 50);
    }
  }

  function closeModal() {
    destroyActiveDemo();
    customModal.classList.remove('open');
    document.body.style.overflow = 'auto'; // Resume scroll
    setTimeout(() => {
      modalContentArea.innerHTML = '';
    }, 400);
  }

  closeModalBtn.addEventListener('click', closeModal);
  customModal.addEventListener('click', (e) => {
    if (e.target === customModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && customModal.classList.contains('open')) {
      closeModal();
    }
  });


  /* ==========================================================================
     PROJECT SIMULATIONS & BLOG READERS
     ========================================================================== */
  const liveDemoBtns = document.querySelectorAll('.live-demo-btn');
  const blogReadBtns = document.querySelectorAll('.blog-read-more');

  /* ==========================================================================
     INTERACTIVE PROJECT DEMO INITIALIZERS & DATA
     ========================================================================== */
  const projectInitializers = {

    /* 1. NETFLIX VIEWING ACTIVITY ANALYSIS */
    "Netflix Viewing Activity Analysis": function() {
      const ctx = document.getElementById('netflix-chart');
      if (!ctx || typeof Chart === 'undefined') return;

      const profileData = {
        all: { hours: [12, 8, 4, 2, 1, 3, 10, 25, 45, 60, 80, 95, 110, 105, 90, 85, 120, 160, 210, 290, 340, 280, 180, 70], topGenre: "Sci-Fi / Drama", totalHours: "1,284 hrs", peak: "9:15 PM" },
        akshat: { hours: [4, 1, 0, 0, 0, 0, 2, 8, 15, 20, 30, 35, 40, 38, 30, 25, 45, 70, 95, 140, 165, 130, 80, 25], topGenre: "Tech & Sci-Fi", totalHours: "612 hrs", peak: "10:00 PM" },
        family: { hours: [8, 7, 4, 2, 1, 3, 8, 17, 30, 40, 50, 60, 70, 67, 60, 60, 75, 90, 115, 150, 175, 150, 100, 45], topGenre: "Comedy / Drama", totalHours: "672 hrs", peak: "8:30 PM" }
      };

      const labels = ['12AM','1AM','2AM','3AM','4AM','5AM','6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM','11PM'];

      activeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Hours Watched per Time Slot',
            data: profileData.all.hours,
            backgroundColor: 'rgba(56, 189, 248, 0.75)',
            borderColor: '#38bdf8',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} views recorded`
              }
            }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
          }
        }
      });

      const profileSelect = document.getElementById('netflix-profile-select');
      if (profileSelect) {
        profileSelect.addEventListener('change', (e) => {
          const val = e.target.value;
          const data = profileData[val] || profileData.all;
          activeChartInstance.data.datasets[0].data = data.hours;
          activeChartInstance.update();

          document.getElementById('netflix-kpi-hours').textContent = data.totalHours;
          document.getElementById('netflix-kpi-peak').textContent = data.peak;
          document.getElementById('netflix-kpi-genre').textContent = data.topGenre;
        });
      }

      const searchInput = document.getElementById('netflix-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          const items = document.querySelectorAll('.netflix-title-item');
          items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? 'flex' : 'none';
          });
        });
      }
    },

    /* 2. CUSTOMER ENGAGEMENT ANALYSIS */
    "Customer Engagement Analysis": function() {
      const ctx = document.getElementById('cohort-chart');
      if (!ctx || typeof Chart === 'undefined') return;

      const cohortDatasets = [
        { label: 'Jan Cohort (n=1,200)', data: [100, 68, 54, 45, 38, 32, 28, 26], borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', tension: 0.35, fill: true },
        { label: 'Feb Cohort (n=1,450)', data: [100, 72, 59, 52, 44, 38, 34, 31], borderColor: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)', tension: 0.35, fill: true },
        { label: 'Mar Cohort (n=1,820)', data: [100, 75, 63, 56, 49, 43, 39, 36], borderColor: '#22c55e', backgroundColor: 'transparent', tension: 0.35 },
        { label: 'Apr Cohort (Optimized)', data: [100, 82, 71, 64, 58, 52, 48, 45], borderColor: '#f59e0b', backgroundColor: 'transparent', borderDash: [5, 5], tension: 0.35 }
      ];

      activeChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Wk 0', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'],
          datasets: cohortDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#cbd5e1', font: { size: 11 } } },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}% active` } }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: (v) => v + '%' } }
          }
        }
      });

      const simulateBtn = document.getElementById('btn-simulate-growth');
      if (simulateBtn) {
        simulateBtn.addEventListener('click', () => {
          simulateBtn.disabled = true;
          simulateBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Running Uplift Model...';
          
          const t = setTimeout(() => {
            activeChartInstance.data.datasets.push({
              label: '🚀 Projected AI Re-engagement',
              data: [100, 88, 79, 73, 68, 63, 59, 56],
              borderColor: '#ec4899',
              borderWidth: 3,
              tension: 0.35
            });
            activeChartInstance.update();

            document.getElementById('cohort-kpi-retention').textContent = '56.0%';
            document.getElementById('cohort-kpi-retention').style.color = '#ec4899';
            document.getElementById('cohort-kpi-ltv').textContent = '$248 (+27%)';

            simulateBtn.innerHTML = '<i class="ri-check-line"></i> Optimization Applied!';
            simulateBtn.classList.add('btn-primary');
          }, 800);
          activeDemoTimeouts.push(t);
        });
      }
    },

    /* 3. HOTEL MANAGEMENT SYSTEM */
    "Hotel Management System": function() {
      const roomRates = { "Deluxe Suite": 180, "Executive King": 240, "Standard Twin": 95 };
      const roomSelect = document.getElementById('hotel-room-type');
      const nightsInput = document.getElementById('hotel-nights');
      const pricePreview = document.getElementById('hotel-price-preview');
      const terminal = document.getElementById('hotel-terminal');
      const bookingForm = document.getElementById('hotel-booking-form');
      const guestsTableBody = document.getElementById('hotel-guests-tbody');
      const activeCountElem = document.getElementById('hotel-active-rooms');

      let activeRoomsCount = 3;

      function updatePrice() {
        const type = roomSelect.value;
        const nights = parseInt(nightsInput.value, 10) || 1;
        const total = (roomRates[type] || 100) * nights;
        pricePreview.innerHTML = `<span>Rate: $${roomRates[type]}/night</span><strong>Total: $${total}</strong>`;
        return { type, nights, total };
      }

      function logTerminal(msg, color = '#4ade80') {
        const time = new Date().toLocaleTimeString();
        terminal.innerHTML += `\n<span style="color:${color}">[${time}] ${msg}</span>`;
        terminal.scrollTop = terminal.scrollHeight;
      }

      if (roomSelect && nightsInput) {
        roomSelect.addEventListener('change', updatePrice);
        nightsInput.addEventListener('input', updatePrice);
        updatePrice();
      }

      if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const nameInput = document.getElementById('hotel-guest-name');
          const guestName = nameInput.value.trim() || 'Anonymous Guest';
          const { type, nights, total } = updatePrice();
          const roomNo = Math.floor(100 + Math.random() * 899);

          logTerminal(`QUERY: INSERT INTO reservations (guest, room, nights, total) VALUES ('${guestName}', ${roomNo}, ${nights}, ${total});`, '#38bdf8');

          const t1 = setTimeout(() => {
            logTerminal(`[SUCCESS] Booking confirmed for ${guestName} in Room #${roomNo}. Invoice INV-${roomNo} generated.`, '#4ade80');

            const tr = document.createElement('tr');
            tr.id = `room-row-${roomNo}`;
            tr.innerHTML = `
              <td><strong>${guestName}</strong></td>
              <td><span style="color:var(--color-primary); font-weight:600;">#${roomNo}</span></td>
              <td>${type}</td>
              <td>$${total}</td>
              <td><span style="color:#22c55e; font-size:0.7rem; font-weight:700;">● Active</span></td>
              <td><button class="btn btn-outline btn-sm hotel-checkout-btn" data-room="${roomNo}" data-name="${guestName}" style="padding:0.2rem 0.5rem; font-size:0.7rem;">Check Out</button></td>
            `;
            guestsTableBody.prepend(tr);

            activeRoomsCount++;
            if (activeCountElem) activeCountElem.textContent = `${activeRoomsCount} Occupied`;

            nameInput.value = '';
          }, 350);
          activeDemoTimeouts.push(t1);
        });
      }

      if (guestsTableBody) {
        guestsTableBody.addEventListener('click', (e) => {
          const checkoutBtn = e.target.closest('.hotel-checkout-btn');
          if (checkoutBtn) {
            const room = checkoutBtn.getAttribute('data-room');
            const name = checkoutBtn.getAttribute('data-name');
            const row = document.getElementById(`room-row-${room}`);
            if (row) {
              row.style.opacity = '0.5';
              row.cells[4].innerHTML = '<span style="color:#94a3b8; font-size:0.7rem;">Checked Out</span>';
              checkoutBtn.remove();
              activeRoomsCount = Math.max(0, activeRoomsCount - 1);
              if (activeCountElem) activeCountElem.textContent = `${activeRoomsCount} Occupied`;
              logTerminal(`[CHECKOUT] Guest ${name} checked out from Room #${room}. Cleaning request dispatched.`, '#f59e0b');
            }
          }
        });
      }
    },

    /* 4. ANONYMOUS CHATROOM APPLICATION */
    "Anonymous Chatroom Application": function() {
      const chatBox = document.getElementById('demo-chat-box');
      const input = document.getElementById('demo-msg-input');
      const sendBtn = document.getElementById('demo-msg-send');
      const roomBtns = document.querySelectorAll('.chat-room-btn');
      const channelLabel = document.getElementById('chat-channel-label');

      const botReplies = [
        "Hey! Sockets connection is running at <12ms latency.",
        "Nice! Just finished deploying the pipeline model.",
        "MongoDB sharding handled the burst traffic smoothly.",
        "Clean portfolio design! The real-time web interaction feels super responsive.",
        "Check out the data analytics dashboard too, very clean insights."
      ];

      function sendChatMessage() {
        const text = input.value.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble me';
        bubble.innerHTML = `
          <span class="chat-bubble-author">You <span class="chat-bubble-time">${time}</span></span>
          ${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        `;
        chatBox.appendChild(bubble);
        chatBox.scrollTop = chatBox.scrollHeight;
        input.value = '';

        const t2 = setTimeout(() => {
          const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
          const botBubble = document.createElement('div');
          botBubble.className = 'chat-bubble them';
          botBubble.innerHTML = `
            <span class="chat-bubble-author">Peer_Echo_${Math.floor(10 + Math.random() * 89)} <span class="chat-bubble-time">${replyTime}</span></span>
            ${randomReply}
          `;
          chatBox.appendChild(botBubble);
          chatBox.scrollTop = chatBox.scrollHeight;
        }, 750);
        activeDemoTimeouts.push(t2);
      }

      if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') sendChatMessage();
        });
      }

      roomBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          roomBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const roomName = btn.getAttribute('data-room');
          if (channelLabel) channelLabel.textContent = '#' + roomName;

          chatBox.innerHTML = `
            <div style="text-align:center; margin: 0.5rem 0; font-size:0.75rem; color:var(--text-muted);">
              Joined <strong>#${roomName}</strong> • Ephemeral encrypted session
            </div>
            <div class="chat-bubble them">
              <span class="chat-bubble-author">Channel_Bot <span class="chat-bubble-time">Just now</span></span>
              Welcome to #${roomName}! Post your queries or test message routing.
            </div>
          `;
        });
      });
    },

    /* 5. SPAIN SONGS ANALYSIS */
    "Spain Songs Analysis": function() {
      const ctx = document.getElementById('songs-radar-chart');
      if (!ctx || typeof Chart === 'undefined') return;

      const songsData = {
        quevedo: { title: "Quevedo: Bzrp Session #52", artist: "Bizarrap & Quevedo", danceability: 91, energy: 78, valence: 55, acousticness: 12, tempo: 128, popularity: 94 },
        despecha: { title: "Despechá", artist: "Rosalía", danceability: 92, energy: 70, valence: 77, acousticness: 15, tempo: 130, popularity: 88 },
        tododeti: { title: "Todo De Ti", artist: "Rauw Alejandro", danceability: 78, energy: 80, valence: 71, acousticness: 31, tempo: 128, popularity: 84 },
        monamour: { title: "Mon Amour (Remix)", artist: "zoilo & Aitana", danceability: 75, energy: 69, valence: 82, acousticness: 18, tempo: 120, popularity: 82 },
        titi: { title: "Tití Me Preguntó", artist: "Bad Bunny", danceability: 88, energy: 72, valence: 60, acousticness: 10, tempo: 106, popularity: 92 }
      };

      activeChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Danceability', 'Energy', 'Valence (Mood)', 'Acousticness', 'Tempo Index', 'Popularity'],
          datasets: [{
            label: 'Quevedo: Bzrp Session #52',
            data: [91, 78, 55, 12, 85, 94],
            backgroundColor: 'rgba(245, 158, 11, 0.25)',
            borderColor: '#f59e0b',
            pointBackgroundColor: '#f59e0b',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#cbd5e1', font: { size: 11 } } }
          },
          scales: {
            r: {
              angleLines: { color: 'rgba(255,255,255,0.08)' },
              grid: { color: 'rgba(255,255,255,0.08)' },
              pointLabels: { color: '#94a3b8', font: { size: 10 } },
              ticks: { display: false, max: 100 }
            }
          }
        }
      });

      const songItems = document.querySelectorAll('.song-item');
      songItems.forEach(item => {
        item.addEventListener('click', () => {
          songItems.forEach(i => i.classList.remove('active'));
          item.classList.add('active');

          const key = item.getAttribute('data-song-key');
          const song = songsData[key];
          if (song && activeChartInstance) {
            activeChartInstance.data.datasets[0].label = `${song.title} (${song.artist})`;
            activeChartInstance.data.datasets[0].data = [
              song.danceability,
              song.energy,
              song.valence,
              song.acousticness,
              Math.min(100, Math.round((song.tempo / 150) * 100)),
              song.popularity
            ];
            activeChartInstance.update();

            document.getElementById('song-playing-title').textContent = song.title;
            document.getElementById('song-playing-artist').textContent = song.artist;
            document.getElementById('song-stat-dance').textContent = song.danceability + '/100';
            document.getElementById('song-stat-bpm').textContent = song.tempo + ' BPM';
          }
        });
      });
    }
  };

  /* ==========================================================================
     PROJECT SIMULATIONS & BLOG READERS DATA
     ========================================================================== */
  const projectData = {
    "Netflix Viewing Activity Analysis": {
      details: `
        <h3 class="modal-title">Netflix Viewing Activity Analysis</h3>
        <p class="modal-desc">Exploratory analytical dashboard built from personal Netflix telemetry. Uncovers peak watching patterns, seasonal habits, and profile viewing behaviors.</p>
        
        <div class="demo-badge-bar">
          <span class="demo-status-pill"><span class="demo-status-dot"></span> Interactive BI Pipeline Active</span>
          <span style="color:var(--text-muted); font-size:0.8rem;"><i class="ri-database-2-line"></i> 4,892 records loaded</span>
        </div>

        <div class="demo-kpi-grid">
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Total Watch Time</span>
            <span class="demo-kpi-val" id="netflix-kpi-hours">1,284 hrs</span>
            <span class="demo-kpi-sub">Across 3 Profiles</span>
          </div>
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Peak Time Slot</span>
            <span class="demo-kpi-val" id="netflix-kpi-peak">9:15 PM</span>
            <span class="demo-kpi-sub">Highest daily traffic</span>
          </div>
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Top Genre</span>
            <span class="demo-kpi-val" id="netflix-kpi-genre" style="font-size:1.1rem;">Sci-Fi / Drama</span>
            <span class="demo-kpi-sub">34% of overall views</span>
          </div>
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Preferred Device</span>
            <span class="demo-kpi-val" style="font-size:1.1rem;">Smart TV</span>
            <span class="demo-kpi-sub">68% TV vs 32% App</span>
          </div>
        </div>

        <div class="demo-controls-bar">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <label style="font-size:0.8rem; color:var(--text-secondary);"><i class="ri-user-settings-line"></i> Profile:</label>
            <select id="netflix-profile-select" class="demo-select">
              <option value="all">All Profiles Combined</option>
              <option value="akshat">Akshat (Primary)</option>
              <option value="family">Family & Living Room</option>
            </select>
          </div>
          <input type="text" id="netflix-search" class="demo-input" placeholder="Search watched title..." style="max-width:200px;">
        </div>

        <div class="demo-chart-box">
          <span style="font-size:0.8rem; font-weight:600; color:var(--text-secondary); display:block; margin-bottom:0.6rem;">
            <i class="ri-bar-chart-2-line"></i> Viewing Frequency by Hour of Day (24-Hour Cycle)
          </span>
          <div class="demo-chart-canvas-wrap">
            <canvas id="netflix-chart"></canvas>
          </div>
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">Sample Watch History Extracts:</div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.5rem; max-height:120px; overflow-y:auto;">
          <div class="netflix-title-item" style="background:rgba(255,255,255,0.03); padding:0.4rem 0.8rem; border-radius:6px; font-size:0.78rem; display:flex; justify-content:space-between;">
            <span>Stranger Things S4</span><span style="color:#38bdf8;">100% Watched</span>
          </div>
          <div class="netflix-title-item" style="background:rgba(255,255,255,0.03); padding:0.4rem 0.8rem; border-radius:6px; font-size:0.78rem; display:flex; justify-content:space-between;">
            <span>Oppenheimer</span><span style="color:#38bdf8;">100% Watched</span>
          </div>
          <div class="netflix-title-item" style="background:rgba(255,255,255,0.03); padding:0.4rem 0.8rem; border-radius:6px; font-size:0.78rem; display:flex; justify-content:space-between;">
            <span>Breaking Bad</span><span style="color:#38bdf8;">94% Watched</span>
          </div>
          <div class="netflix-title-item" style="background:rgba(255,255,255,0.03); padding:0.4rem 0.8rem; border-radius:6px; font-size:0.78rem; display:flex; justify-content:space-between;">
            <span>Cyberpunk: Edgerunners</span><span style="color:#38bdf8;">100% Watched</span>
          </div>
        </div>

        <div class="modal-buttons">
          <span style="font-size:0.8rem; color:var(--text-muted);"><i class="ri-check-double-line"></i> Client-side interactive web dashboard</span>
          <a href="https://github.com/akshat-manhar" target="_blank" class="btn btn-outline btn-sm"><i class="ri-github-fill"></i> View Python Notebook</a>
        </div>
      `
    },

    "Customer Engagement Analysis": {
      details: `
        <h3 class="modal-title">Customer Engagement Analysis</h3>
        <p class="modal-desc">Multi-cohort retention engine modeling subscriber journeys, tracking drop-offs across 8-week cycles and simulating customer lifetime values (LTV).</p>
        
        <div class="demo-badge-bar">
          <span class="demo-status-pill"><span class="demo-status-dot"></span> Cohort Analytics & LTV Engine</span>
          <span style="color:var(--text-muted); font-size:0.8rem;"><i class="ri-team-line"></i> 12,400 tracked users</span>
        </div>

        <div class="demo-kpi-grid">
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">30-Day Retention</span>
            <span class="demo-kpi-val" id="cohort-kpi-retention">44.8%</span>
            <span class="demo-kpi-sub">+4.2% above benchmark</span>
          </div>
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Avg Customer LTV</span>
            <span class="demo-kpi-val" id="cohort-kpi-ltv">$194.50</span>
            <span class="demo-kpi-sub">Payback: 1.8 months</span>
          </div>
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Monthly Churn</span>
            <span class="demo-kpi-val">7.2%</span>
            <span class="demo-kpi-sub">Reduced by 1.9%</span>
          </div>
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Avg Session</span>
            <span class="demo-kpi-val">18.4 min</span>
            <span class="demo-kpi-sub">3.2 daily visits</span>
          </div>
        </div>

        <div class="demo-controls-bar">
          <span style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);">
            <i class="ri-line-chart-line"></i> 8-Week Cohort Decay Curves
          </span>
          <button id="btn-simulate-growth" class="btn btn-outline btn-sm">
            <i class="ri-flashlight-line"></i> Simulate AI Optimization Uplift
          </button>
        </div>

        <div class="demo-chart-box">
          <div class="demo-chart-canvas-wrap">
            <canvas id="cohort-chart"></canvas>
          </div>
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">Retention Heatmap Matrix (% Active):</div>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.75rem; text-align:center;">
            <thead>
              <tr style="border-bottom:1px solid var(--glass-border); color:var(--text-muted);">
                <th style="padding:0.4rem; text-align:left;">Cohort</th>
                <th>Users</th><th>Wk 0</th><th>Wk 1</th><th>Wk 2</th><th>Wk 4</th><th>Wk 6</th><th>Wk 8</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
                <td style="padding:0.4rem; text-align:left; font-weight:600;">Jan 2026</td>
                <td>1,200</td>
                <td style="background:rgba(56,189,248,0.4); color:#fff;">100%</td>
                <td style="background:rgba(56,189,248,0.28);">68%</td>
                <td style="background:rgba(56,189,248,0.22);">54%</td>
                <td style="background:rgba(56,189,248,0.16);">38%</td>
                <td style="background:rgba(56,189,248,0.12);">28%</td>
                <td style="background:rgba(56,189,248,0.1);">26%</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
                <td style="padding:0.4rem; text-align:left; font-weight:600;">Feb 2026</td>
                <td>1,450</td>
                <td style="background:rgba(56,189,248,0.4); color:#fff;">100%</td>
                <td style="background:rgba(56,189,248,0.32);">72%</td>
                <td style="background:rgba(56,189,248,0.25);">59%</td>
                <td style="background:rgba(56,189,248,0.18);">44%</td>
                <td style="background:rgba(56,189,248,0.15);">34%</td>
                <td style="background:rgba(56,189,248,0.12);">31%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-buttons">
          <span style="font-size:0.8rem; color:var(--text-muted);"><i class="ri-check-line"></i> Dynamic cohort simulator ready</span>
          <a href="https://github.com/akshat-manhar" target="_blank" class="btn btn-outline btn-sm"><i class="ri-github-fill"></i> Source Code</a>
        </div>
      `
    },

    "Hotel Management System": {
      details: `
        <h3 class="modal-title">Hotel Management System</h3>
        <p class="modal-desc">Interactive Property Management System (PMS) web app simulation. Handles guest check-ins, automated billing, room state mapping, and SQL operations.</p>
        
        <div class="demo-badge-bar">
          <span class="demo-status-pill"><span class="demo-status-dot"></span> PMS Admin Console v2.4</span>
          <span id="hotel-active-rooms" style="color:var(--color-primary); font-weight:600; font-size:0.8rem;">3 Occupied</span>
        </div>

        <div class="hotel-console-grid">
          <!-- Left: Booking Form -->
          <div class="hotel-panel">
            <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary); display:block; margin-bottom:0.8rem;">
              <i class="ri-hotel-bed-line"></i> New Guest Registration
            </span>
            <form id="hotel-booking-form">
              <div class="hotel-input-group">
                <label>Guest Full Name</label>
                <input type="text" id="hotel-guest-name" value="Jane Doe" required>
              </div>
              <div class="hotel-input-group">
                <label>Room Category</label>
                <select id="hotel-room-type">
                  <option value="Deluxe Suite">Deluxe Suite ($180/night)</option>
                  <option value="Executive King">Executive King ($240/night)</option>
                  <option value="Standard Twin">Standard Twin ($95/night)</option>
                </select>
              </div>
              <div class="hotel-input-group">
                <label>Nights of Stay</label>
                <input type="number" id="hotel-nights" value="3" min="1" max="30">
              </div>
              <div class="hotel-price-preview" id="hotel-price-preview">
                <span>Calculating rate...</span>
              </div>
              <button type="submit" class="btn btn-primary btn-block btn-sm" style="width:100%; border-radius:6px;">
                <i class="ri-check-line"></i> Check In & Book Room
              </button>
            </form>
          </div>

          <!-- Right: Active Guests & SQL Terminal -->
          <div class="hotel-panel">
            <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary); display:block; margin-bottom:0.6rem;">
              <i class="ri-table-line"></i> Current Occupancy Registry
            </span>
            <div class="hotel-table-wrap">
              <table class="hotel-table">
                <thead>
                  <tr>
                    <th>Guest</th><th>Room</th><th>Type</th><th>Total</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody id="hotel-guests-tbody">
                  <tr id="room-row-204">
                    <td><strong>Sarah Connor</strong></td>
                    <td><span style="color:var(--color-primary); font-weight:600;">#204</span></td>
                    <td>Deluxe Suite</td>
                    <td>$540</td>
                    <td><span style="color:#22c55e; font-size:0.7rem; font-weight:700;">● Active</span></td>
                    <td><button class="btn btn-outline btn-sm hotel-checkout-btn" data-room="204" data-name="Sarah Connor" style="padding:0.2rem 0.5rem; font-size:0.7rem;">Check Out</button></td>
                  </tr>
                  <tr id="room-row-108">
                    <td><strong>Bruce Wayne</strong></td>
                    <td><span style="color:var(--color-primary); font-weight:600;">#108</span></td>
                    <td>Executive King</td>
                    <td>$480</td>
                    <td><span style="color:#22c55e; font-size:0.7rem; font-weight:700;">● Active</span></td>
                    <td><button class="btn btn-outline btn-sm hotel-checkout-btn" data-room="108" data-name="Bruce Wayne" style="padding:0.2rem 0.5rem; font-size:0.7rem;">Check Out</button></td>
                  </tr>
                  <tr id="room-row-312">
                    <td><strong>Clark Kent</strong></td>
                    <td><span style="color:var(--color-primary); font-weight:600;">#312</span></td>
                    <td>Standard Twin</td>
                    <td>$190</td>
                    <td><span style="color:#22c55e; font-size:0.7rem; font-weight:700;">● Active</span></td>
                    <td><button class="btn btn-outline btn-sm hotel-checkout-btn" data-room="312" data-name="Clark Kent" style="padding:0.2rem 0.5rem; font-size:0.7rem;">Check Out</button></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:0.2rem;">
              <i class="ri-terminal-box-line"></i> SQLite Backend Stream
            </span>
            <div class="hotel-terminal" id="hotel-terminal">[INIT] Database connected: /data/hotel_pms.db&#10;[SYNC] 3 active room sessions synchronized.&#10;[READY] Awaiting guest check-in transactions...</div>
          </div>
        </div>

        <div class="modal-buttons">
          <span style="font-size:0.8rem; color:var(--text-muted);"><i class="ri-shield-check-line"></i> Full frontend CRUD simulation</span>
          <a href="https://github.com/akshat-manhar" target="_blank" class="btn btn-outline btn-sm"><i class="ri-github-fill"></i> Source Code</a>
        </div>
      `
    },

    "Anonymous Chatroom Application": {
      details: `
        <h3 class="modal-title">Anonymous Chatroom Application</h3>
        <p class="modal-desc">Real-time socket-driven communication application. Features channel switching, instant peer broadcasting, message persistence, and encryption.</p>
        
        <div class="demo-badge-bar">
          <span class="demo-status-pill"><span class="demo-status-dot"></span> Node.js WebSocket & MongoDB Connected</span>
          <span style="color:var(--text-muted); font-size:0.8rem;"><i class="ri-user-shared-line"></i> 5 Active Peers in Room</span>
        </div>

        <div class="chat-window">
          <!-- Chat Header -->
          <div class="chat-header">
            <div>
              <span id="chat-channel-label" style="font-weight:700; color:var(--color-primary);">#general</span>
              <span style="font-size:0.75rem; color:var(--text-muted); margin-left:0.5rem;">• Ephemeral Chat</span>
            </div>
            <div class="chat-rooms-nav">
              <button class="chat-room-btn active" data-room="general">#general</button>
              <button class="chat-room-btn" data-room="data-science">#data-science</button>
              <button class="chat-room-btn" data-room="dev-chat">#dev-chat</button>
            </div>
          </div>

          <!-- Chat Messages -->
          <div class="chat-messages-area" id="demo-chat-box">
            <div class="chat-bubble them">
              <span class="chat-bubble-author">Cyber_Fox <span class="chat-bubble-time">10:14 AM</span></span>
              Hey everyone! Is anyone deploying their Pandas pipelines with FastApi or Node?
            </div>
            <div class="chat-bubble them">
              <span class="chat-bubble-author">DataNinja <span class="chat-bubble-time">10:15 AM</span></span>
              FastAPI handles vectorized serialization quickly, highly recommended!
            </div>
            <div class="chat-bubble me">
              <span class="chat-bubble-author">You <span class="chat-bubble-time">10:16 AM</span></span>
              Testing this portfolio live demo right now! Web application works smoothly.
            </div>
          </div>

          <!-- Input Bar -->
          <div class="chat-input-bar">
            <input type="text" id="demo-msg-input" class="demo-input" placeholder="Type a message anonymously..." style="flex:1;">
            <button id="demo-msg-send" class="btn btn-primary btn-sm" style="border-radius:6px; padding:0.45rem 1rem;">
              Send <i class="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div class="modal-buttons">
          <span style="font-size:0.8rem; color:var(--text-muted);"><i class="ri-wireless-charging-line"></i> Interactive simulated socket response</span>
          <a href="https://github.com/akshat-manhar" target="_blank" class="btn btn-outline btn-sm"><i class="ri-github-fill"></i> Source Code</a>
        </div>
      `
    },

    "Spain Songs Analysis": {
      details: `
        <h3 class="modal-title">Spain Songs Analysis</h3>
        <p class="modal-desc">Interactive Spotify audio feature radar & popularity analytics. Examines acoustic indicators, rhythmic cadences, and genre dominance in Spain's top charts.</p>
        
        <div class="demo-badge-bar">
          <span class="demo-status-pill"><span class="demo-status-dot"></span> Spotify Spain Top Charts Telemetry</span>
          <span style="color:var(--text-muted); font-size:0.8rem;"><i class="ri-spotify-line"></i> 50 Chart Hits Analyzed</span>
        </div>

        <div class="demo-kpi-grid">
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Danceability</span>
            <span class="demo-kpi-val" id="song-stat-dance">91/100</span>
            <span class="demo-kpi-sub">Dominant attribute</span>
          </div>
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Tempo Cadence</span>
            <span class="demo-kpi-val" id="song-stat-bpm">128 BPM</span>
            <span class="demo-kpi-sub">Urban Latin rhythm</span>
          </div>
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Dominant Genre</span>
            <span class="demo-kpi-val" style="font-size:1.1rem;">Reggaeton / Pop</span>
            <span class="demo-kpi-sub">64% of top 50 songs</span>
          </div>
          <div class="demo-kpi-card">
            <span class="demo-kpi-label">Harmonic Mode</span>
            <span class="demo-kpi-val" style="font-size:1.1rem;">A Minor</span>
            <span class="demo-kpi-sub">Preferred harmonic key</span>
          </div>
        </div>

        <div class="songs-grid">
          <!-- Left: Interactive Playlist -->
          <div class="hotel-panel">
            <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary); display:block; margin-bottom:0.8rem;">
              <i class="ri-music-2-line"></i> Select Track to Inspect Audio Radar
            </span>
            <div class="songs-list">
              <div class="song-item active" data-song-key="quevedo">
                <div class="song-item-info">
                  <div class="song-item-icon"><i class="ri-disc-line"></i></div>
                  <div>
                    <strong style="display:block;">Quevedo: Bzrp Session #52</strong>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Bizarrap, Quevedo • Pop: 94</span>
                  </div>
                </div>
                <div class="soundwave-box">
                  <div class="soundwave-bar"></div><div class="soundwave-bar"></div><div class="soundwave-bar"></div><div class="soundwave-bar"></div>
                </div>
              </div>

              <div class="song-item" data-song-key="despecha">
                <div class="song-item-info">
                  <div class="song-item-icon"><i class="ri-disc-line"></i></div>
                  <div>
                    <strong style="display:block;">Despechá</strong>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Rosalía • Pop: 88</span>
                  </div>
                </div>
              </div>

              <div class="song-item" data-song-key="tododeti">
                <div class="song-item-info">
                  <div class="song-item-icon"><i class="ri-disc-line"></i></div>
                  <div>
                    <strong style="display:block;">Todo De Ti</strong>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Rauw Alejandro • Pop: 84</span>
                  </div>
                </div>
              </div>

              <div class="song-item" data-song-key="monamour">
                <div class="song-item-info">
                  <div class="song-item-icon"><i class="ri-disc-line"></i></div>
                  <div>
                    <strong style="display:block;">Mon Amour (Remix)</strong>
                    <span style="font-size:0.75rem; color:var(--text-muted);">zoilo, Aitana • Pop: 82</span>
                  </div>
                </div>
              </div>

              <div class="song-item" data-song-key="titi">
                <div class="song-item-info">
                  <div class="song-item-icon"><i class="ri-disc-line"></i></div>
                  <div>
                    <strong style="display:block;">Tití Me Preguntó</strong>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Bad Bunny • Pop: 92</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mini Player Indicator -->
            <div style="margin-top:0.8rem; padding:0.6rem 0.8rem; background:rgba(255,255,255,0.03); border-radius:6px; font-size:0.78rem;">
              <span style="color:var(--text-muted); display:block; font-size:0.7rem;">NOW INSPECTING:</span>
              <strong id="song-playing-title" style="color:var(--color-primary);">Quevedo: Bzrp Session #52</strong>
              <div id="song-playing-artist" style="color:var(--text-secondary); font-size:0.72rem;">Bizarrap & Quevedo</div>
            </div>
          </div>

          <!-- Right: Radar Chart -->
          <div class="hotel-panel">
            <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary); display:block; margin-bottom:0.6rem;">
              <i class="ri-radar-line"></i> 6-Dimension Audio Signature Radar
            </span>
            <div class="demo-chart-canvas-wrap" style="height:250px;">
              <canvas id="songs-radar-chart"></canvas>
            </div>
          </div>
        </div>

        <div class="modal-buttons">
          <span style="font-size:0.8rem; color:var(--text-muted);"><i class="ri-bar-chart-box-line"></i> Click tracks to compare radar profiles</span>
          <a href="https://github.com/akshat-manhar" target="_blank" class="btn btn-outline btn-sm"><i class="ri-github-fill"></i> Source Code</a>
        </div>
      `
    }
  };

  // Blog content data mapping
  const blogData = {
    "Data Analysis Tips": {
      title: "Data Analysis Tips for Beginners",
      content: `
        <h3 class="modal-title">Data Analysis Tips for Beginners</h3>
        <p class="modal-desc">Published on: Jun 2026 | Category: Analytics | 5 min read</p>
        <div style="color: var(--text-secondary); font-size: 0.95rem; line-height:1.7; display:flex; flex-direction:column; gap:1.2rem;">
          <p>Exploratory Data Analysis (EDA) is the cornerstone of any analytical workflow. When tackling a new dataset, it is vital to avoid drawing instant conclusions and instead structure your inspection stages logically.</p>
          <p><strong>1. Understand the Shape & Form</strong>: Always initiate your pipelines by reviewing missing elements and data types. In Python, utilizing functions like <code>df.info()</code> and <code>df.isna().sum()</code> immediately guides your cleaning strategy.</p>
          <p><strong>2. Outlier Management</strong>: Don't just drop out-of-range figures. Analyze if they indicate data entry corruptions or represent rare but important spikes. Use boxplots to visualize distributions and establish IQR boundaries.</p>
          <p><strong>3. Streamline Cleaning</strong>: When transforming datasets, keep your code modular. Establish pipelines with Pandas operations using <code>.pipe()</code> to maintain read-friendliness, scalability, and easy bug tracing.</p>
        </div>
      `
    },
    "Python Tutorials": {
      title: "Python Tutorials: Advanced Pandas",
      content: `
        <h3 class="modal-title">Python Tutorials: Advanced Pandas</h3>
        <p class="modal-desc">Published on: May 2026 | Category: Programming | 7 min read</p>
        <div style="color: var(--text-secondary); font-size: 0.95rem; line-height:1.7; display:flex; flex-direction:column; gap:1.2rem;">
          <p>While many utilize Pandas for simple csv conversions and basic filtering, its core engine is capable of executing complex aggregation matrices, multi-indexing, and vectorized mapping.</p>
          <p><strong>Multi-Indexing (Hierarchical Indexing)</strong>: Allows you to work with multi-dimensional dimensions in a single 2D DataFrame. Learn to use <code>.xs()</code> (cross-sections) to pull specific layers of data from deeply grouped aggregates.</p>
          <p><strong>Vectorization over Iteration</strong>: Avoid loops like <code>.iterrows()</code> at all costs. Instead, make use of Pandas vectorized math operations, which leverage pre-compiled C-level loops, speeding up processing times by up to 100x.</p>
          <p><strong>Memory Optimizations</strong>: For large datasets, load column subgroups using <code>usecols</code>. Cast standard strings to <code>category</code> types to reduce memory usage by up to 80% on repeated parameters.</p>
        </div>
      `
    },
    "SQL Concepts": {
      title: "SQL Concepts Every BI Developer Needs",
      content: `
        <h3 class="modal-title">SQL Concepts Every BI Developer Needs</h3>
        <p class="modal-desc">Published on: Apr 2026 | Category: Databases | 4 min read</p>
        <div style="color: var(--text-secondary); font-size: 0.95rem; line-height:1.7; display:flex; flex-direction:column; gap:1.2rem;">
          <p>For any BI Dashboard to run in real-time, the database querying layer must be highly optimized. Slow-loading charts are usually caused by redundant queries or poor indexing structures.</p>
          <p><strong>1. CTEs (Common Table Expressions)</strong>: Rather than structuring deep nested subqueries, write clean Common Table Expressions using the <code>WITH</code> statement. CTEs isolate subsets of logic, improving query review and caching.</p>
          <p><strong>2. Window Functions</strong>: Functions like <code>ROW_NUMBER()</code>, <code>LEAD()</code>, <code>LAG()</code>, and <code>RANK()</code> allow developers to execute moving averages and running totals without performing slow table self-joins.</p>
          <p><strong>3. Query Plans</strong>: Run <code>EXPLAIN ANALYZE</code> on your complex select calls. Locate scan markers (like full index scans) to place custom indexes on columns that drive your joins and where filter clauses.</p>
        </div>
      `
    },
    "Project Development Logs": {
      title: "Project Development Logs",
      content: `
        <h3 class="modal-title">Project Development Logs</h3>
        <p class="modal-desc">Published on: Feb 2026 | Category: Project Log | 8 min read</p>
        <div style="color: var(--text-secondary); font-size: 0.95rem; line-height:1.7; display:flex; flex-direction:column; gap:1.2rem;">
          <p>Building local client-side applications requires a firm grasp of state control, visual layout structures, and asynchronous networking models.</p>
          <p><strong>Tkinter GUI Structuring</strong>: When building the Hotel Management System, balancing standard grids while maintaining responsive sizes was key. Utilizing custom canvases and scaling grids via weight indices solved alignment problems.</p>
          <p><strong>Real-Time Socket Events</strong>: For the Anonymous Chatroom project, handling disconnections gracefully was vital. Implementing heartbeat pings from the client to Node.js ensured sockets cleaned up inactive database instances, keeping server loads low.</p>
        </div>
      `
    }
  };

  // Add click events to Live Demos
  liveDemoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const projectKey = btn.getAttribute('data-project');
      if (projectData[projectKey]) {
        openModal(projectData[projectKey].details, projectKey);
      }
    });
  });

  // Add click events to Blog Read buttons
  blogReadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const blogKey = btn.getAttribute('data-blog');
      if (blogData[blogKey]) {
        openModal(blogData[blogKey].content);
      }
    });
  });


  /* ==========================================================================
     RESUME DOWNLOAD CONFETTI CELEBRATION
     ========================================================================== */
  const resumeBtns = [document.getElementById('nav-resume-btn'), document.getElementById('hero-resume-btn'), document.querySelector('.mobile-resume-btn')];
  
  resumeBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        // Trigger a burst of confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#a855f7', '#6366f1']
        });
      });
    }
  });


  /* ==========================================================================
     CONTACT FORM HANDLING & SUCCESS MODAL
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Stop page reload

      const nameVal = document.getElementById('form-name').value.trim();
      const emailVal = document.getElementById('form-email').value.trim();
      const subjectVal = document.getElementById('form-subject').value.trim();
      const messageVal = document.getElementById('form-message').value.trim();

      if (!nameVal || !emailVal || !subjectVal || !messageVal) {
        alert("Please fill out all contact fields.");
        return;
      }

      // Simulated success layout
      const successHtml = `
        <div style="text-align: center; padding: 1rem 0;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(34, 197, 94, 0.1); color: #22c55e; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1.5rem auto; box-shadow: 0 0 20px rgba(34,197,94,0.2);">
            <i class="ri-checkbox-circle-line"></i>
          </div>
          <h3 class="modal-title" style="margin-bottom:0.5rem;">Message Sent Successfully!</h3>
          <p class="modal-desc" style="margin-bottom: 2rem;">Thank you, <strong>${escapeHtml(nameVal)}</strong>. Your inquiry has been received. Akshat will get back to you at <strong>${escapeHtml(emailVal)}</strong> shortly.</p>
          <div style="display:flex; justify-content:center;">
            <button class="btn btn-primary btn-sm" onclick="document.getElementById('custom-modal').classList.remove('open'); document.body.style.overflow='auto';">Close Panel</button>
          </div>
        </div>
      `;

      // Trigger Confetti!
      const end = Date.now() + (2 * 1000); // 2 seconds burst
      const colors = ['#38bdf8', '#a855f7'];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      // Open Success Modal
      openModal(successHtml);

      // Reset Form fields
      contactForm.reset();
    });
  }

  // Simple string escape function for XSS protection in simulated modals
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

});
