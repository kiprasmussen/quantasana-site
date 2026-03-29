/* ============================================
   QUANTASANA — Main JavaScript
   Navigation, scroll effects, tabs, animations
   ============================================ */

(function () {
  'use strict';

  // --- DOM References ---
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('navHamburger');
  const flyout = document.getElementById('navFlyout');
  const pill = document.getElementById('navPill');
  const navRight = document.querySelector('.nav__right');
  const dropdown = document.getElementById('navDropdown');
  const overlay = document.getElementById('navOverlay');
  const flyoutLinks = flyout ? flyout.querySelectorAll('.nav__flyout-link') : [];
  const dropdownLinks = dropdown ? dropdown.querySelectorAll('.nav__dropdown-link') : [];

  const scrollAnimEls = document.querySelectorAll('.anim-scroll');

  // Breakpoint for desktop
  const DESKTOP_BP = 768;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_BP;
  }


  // --- Desktop: Wrap flyout link text into individual letter spans ---
  var totalCharsBefore = []; // cumulative char count before each link (for global stagger)
  (function initLetterSpans() {
    var runningTotal = 0;
    flyoutLinks.forEach(function (link, linkIndex) {
      totalCharsBefore.push(runningTotal);
      var span = link.querySelector('span');
      if (!span) return;
      var text = span.textContent;
      span.textContent = '';
      for (var ci = 0; ci < text.length; ci++) {
        var letterEl = document.createElement('span');
        letterEl.className = 'nav__letter';
        letterEl.textContent = text[ci];
        // Open delay: link stagger (80ms per link) + char stagger (30ms per char)
        var openDelay = (linkIndex * 80) + (ci * 30) + 200; // +200ms wait for bar to start expanding
        // Close delay: reversed — last char of last link = 0ms, first char of first link = longest
        var closeDelay = ((text.length - 1 - ci) * 25); // per-char reverse within each word
        letterEl.style.setProperty('--char-delay', openDelay + 'ms');
        letterEl.style.setProperty('--close-delay', closeDelay + 'ms');
        span.appendChild(letterEl);
      }
      runningTotal += text.length;
    });
  })();


  // --- Navigation: Frosted Glass on Scroll ---
  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }

  function updateNav() {
    if (lastScrollY > 60) {
      nav.classList.add('nav--frosted');
    } else {
      nav.classList.remove('nav--frosted');
    }
    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  // --- Navigation: Menu Open/Close ---
  let menuOpen = false;
  var closeAnimTimer = null;

  function openMenu() {
    menuOpen = true;
    clearTimeout(closeAnimTimer);
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');

    if (isDesktop()) {
      flyout.classList.remove('is-closing');
      flyout.classList.add('is-open');
      flyout.setAttribute('aria-hidden', 'false');
      navRight.classList.add('is-open');
    } else {
      pill.classList.add('is-open');
      overlay.classList.add('is-visible');
    }
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');

    if (isDesktop()) {
      // Phase 1: trigger letter sweep-out
      flyout.classList.remove('is-open');
      flyout.classList.add('is-closing');
      navRight.classList.remove('is-open');
      flyout.setAttribute('aria-hidden', 'true');

      // Phase 2: after sweep-out completes, clean up
      clearTimeout(closeAnimTimer);
      closeAnimTimer = setTimeout(function () {
        flyout.classList.remove('is-closing');
      }, 600);
    } else {
      pill.classList.remove('is-open');
      overlay.classList.remove('is-visible');
    }
  }

  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMenu();
  });

  // --- Desktop: hover to open/close with 200ms leave delay ---
  var hoverLeaveTimer = null;

  navRight.addEventListener('mouseenter', function () {
    if (!isDesktop()) return;
    clearTimeout(hoverLeaveTimer);
    if (!menuOpen) openMenu();
  });

  navRight.addEventListener('mouseleave', function () {
    if (!isDesktop()) return;
    clearTimeout(hoverLeaveTimer);
    hoverLeaveTimer = setTimeout(function () {
      if (menuOpen) closeMenu();
    }, 200);
  });

  // Close on link click (desktop flyout)
  flyoutLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on link click (mobile overlay)
  dropdownLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close menu when clicking overlay or outside nav
  overlay.addEventListener('click', closeMenu);

  document.addEventListener('click', function (e) {
    if (!menuOpen) return;
    if (!nav.contains(e.target) && e.target !== overlay) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // Close menu on window resize crossing the breakpoint
  window.addEventListener('resize', function () {
    if (menuOpen) {
      closeMenu();
    }
  });


  // --- Smooth Scroll for all Nav Links ---
  function handleNavLinkClick(e) {
    var href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      closeMenu();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  flyoutLinks.forEach(function (link) {
    link.addEventListener('click', handleNavLinkClick);
  });
  dropdownLinks.forEach(function (link) {
    link.addEventListener('click', handleNavLinkClick);
  });


  // --- Scroll-Driven Tab Switching (Section 4: The System) ---
  (function() {
    if (window.innerWidth < 768) return;

    var wrapper = document.querySelector('.system-wrapper');
    var tabs = document.querySelectorAll('.system-tab');
    var contents = document.querySelectorAll('.system-tab-content');
    var images = document.querySelectorAll('.system-img');

    if (!wrapper || !tabs.length) return;

    var currentTab = -1;
    var totalTabs = 6;

    function setActiveTab(index) {
      if (index === currentTab) return;
      currentTab = index;

      // Update tab buttons
      tabs.forEach(function(tab, i) {
        tab.classList.toggle('active', i === index);
      });

      // Update content panels
      contents.forEach(function(content, i) {
        content.classList.toggle('active', i === index);
      });

      // Update images with slide effect
      images.forEach(function(img, i) {
        if (i === index) {
          img.classList.add('active');
        } else {
          img.classList.remove('active');
        }
      });
    }

    // Scroll-driven
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var rect = wrapper.getBoundingClientRect();
          var viewportHeight = window.innerHeight;

          if (rect.bottom < 0 || rect.top > viewportHeight) {
            ticking = false;
            return;
          }

          var scrolled = -rect.top;
          var scrollable = rect.height - viewportHeight;
          if (scrollable <= 0) { ticking = false; return; }

          var progress = Math.max(0, Math.min(1, scrolled / scrollable));

          // 6 equal zones
          var zone = Math.min(totalTabs - 1, Math.floor(progress * totalTabs));
          setActiveTab(zone);

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Click tabs scroll to zone
    tabs.forEach(function(tab, index) {
      tab.addEventListener('click', function() {
        var wrapperTop = wrapper.offsetTop;
        var scrollable = wrapper.offsetHeight - window.innerHeight;
        // Target the middle of each zone
        var targetProgress = (index + 0.5) / totalTabs;
        var targetScroll = wrapperTop + (scrollable * targetProgress);

        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      });
    });

    // Initialize
    setActiveTab(0);
  })();


  // --- Scroll-Triggered Animations (IntersectionObserver) ---
  if ('IntersectionObserver' in window) {
    var animObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    scrollAnimEls.forEach(function (el) {
      animObserver.observe(el);
    });
  } else {
    // Fallback: show everything immediately
    scrollAnimEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }


  // --- Performance: will-change cleanup ---
  var willChangeTimeout;
  window.addEventListener('scroll', function () {
    nav.style.willChange = 'backdrop-filter';
    clearTimeout(willChangeTimeout);
    willChangeTimeout = setTimeout(function () {
      nav.style.willChange = 'auto';
    }, 200);
  }, { passive: true });

  // --- Hero Video: Single autoplay, freezes on last frame ---
  (function initHeroVideo() {
    var video = document.getElementById('heroVideo');
    if (!video) return;

    var isMobile = window.innerWidth <= 768;
    video.src = isMobile ? 'quantasana hero mobile 2.mp4' : 'quantasana hero desktop 2.mp4';
  })();


  // ═══ HERO SHRINK ON SCROLL (No Sticky) ═══
  (function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    // Config — adjust these to taste
    var SHRINK_START = 0;          // scroll position where shrink begins (px)
    var SHRINK_DISTANCE = 400;     // how many px of scroll = full shrink
    var MAX_SCALE = 0.92;          // smallest scale (1 = full, 0.92 = 8% smaller)
    var MAX_RADIUS = 24;           // max border-radius in px
    var MAX_VERTICAL_MARGIN = 20;  // top margin to push hero down slightly

    function onScroll() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // Only apply effect while hero is in view
      if (scrollY > hero.offsetHeight + 200) return;

      // Progress: 0 = no shrink, 1 = fully shrunk
      var progress = Math.min(1, Math.max(0,
        (scrollY - SHRINK_START) / SHRINK_DISTANCE
      ));

      // Ease the progress for smoother feel
      var ease = progress * progress;

      // Calculate values
      var scale = 1 - ((1 - MAX_SCALE) * ease);
      var radius = MAX_RADIUS * ease;
      var marginTop = MAX_VERTICAL_MARGIN * ease;

      // Apply transform and radius
      hero.style.transform = 'scale(' + scale + ')';
      hero.style.borderRadius = radius + 'px';
      hero.style.marginTop = marginTop + 'px';
      hero.style.transformOrigin = 'center top';
    }

    // Smooth scroll listener with requestAnimationFrame
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial state
    onScroll();
  })();


  // ═══ SCROLL-DRIVEN TYPE & ERASE TRANSITIONS ═══
  (function() {
    document.querySelectorAll('.transition-wrapper').forEach(function(wrapper) {
      var section = wrapper.querySelector('.transition-section');
      var lines = wrapper.querySelectorAll('.transition-text');
      var totalLines = lines.length;

      if (!section || !totalLines) return;

      // Wrap each character in a span
      lines.forEach(function(line) {
        var text = line.textContent.trim();
        line.textContent = '';
        for (var i = 0; i < text.length; i++) {
          var span = document.createElement('span');
          span.className = 'char';
          span.textContent = text[i];
          line.appendChild(span);
        }
      });

      function onScroll() {
        var rect = wrapper.getBoundingClientRect();
        var viewportHeight = window.innerHeight;

        if (rect.bottom < 0 || rect.top > viewportHeight) return;

        var scrolled = -rect.top;
        var scrollable = rect.height - viewportHeight;
        if (scrollable <= 0) return;

        var progress = Math.max(0, Math.min(1, scrolled / scrollable));
        var lineProgress = progress * totalLines;
        var lineIndex = Math.min(totalLines - 1, Math.floor(lineProgress));
        var withinLine = lineProgress - lineIndex;

        lines.forEach(function(line, i) {
          if (i === lineIndex) {
            line.classList.add('visible');
            var chars = line.querySelectorAll('.char');
            var totalChars = chars.length;

            if (withinLine < 0.7) {
              var typingProgress = withinLine / 0.7;
              var charsToShow = Math.floor(typingProgress * totalChars);
              chars.forEach(function(c, ci) {
                c.classList.toggle('revealed', ci < charsToShow);
              });
            } else if (withinLine < 0.85) {
              chars.forEach(function(c) { c.classList.add('revealed'); });
            } else {
              var eraseProgress = (withinLine - 0.85) / 0.15;
              var charsToHide = Math.floor(eraseProgress * totalChars);
              chars.forEach(function(c, ci) {
                c.classList.toggle('revealed', ci >= charsToHide);
              });
            }
          } else {
            line.classList.remove('visible');
            line.querySelectorAll('.char').forEach(function(c) {
              c.classList.remove('revealed');
            });
          }
        });
      }

      var ticking = false;
      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(function() {
            onScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      onScroll();
    });
  })();

  // ═══ SCIENCE SECTION — SCROLL-DRIVEN PANEL TRANSITIONS ═══
  (function() {
    // Skip on mobile
    if (window.innerWidth < 768) return;

    var wrapper = document.querySelector('.science-wrapper');
    var panels = document.querySelectorAll('.science-panel');

    if (!wrapper || !panels.length) return;

    var currentActive = -1;

    // ── Set active panel (visual update only) ──
    function setActivePanel(index) {
      if (index === currentActive) return;
      currentActive = index;

      panels.forEach(function(panel, i) {
        if (i === index) {
          panel.classList.add('active');
          panel.style.flex = '1.5';
        } else {
          panel.classList.remove('active');
          panel.style.flex = '0.5';
        }
      });
    }

    // ── Scroll progress calculation ──
    function onScroll() {
      var rect = wrapper.getBoundingClientRect();
      var viewportHeight = window.innerHeight;

      // Only active when wrapper is in view
      if (rect.bottom < 0 || rect.top > viewportHeight) return;

      var scrolled = -rect.top;
      var scrollable = rect.height - viewportHeight;

      if (scrollable <= 0) return;

      var progress = Math.max(0, Math.min(1, scrolled / scrollable));

      if (progress < 0.33) {
        setActivePanel(0);
      } else if (progress < 0.66) {
        setActivePanel(1);
      } else {
        setActivePanel(2);
      }
    }

    // ── Throttled scroll listener ──
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // ── Click → scroll to that panel's zone ──
    panels.forEach(function(panel, index) {
      panel.addEventListener('click', function() {
        // Calculate the scroll position for this panel's zone
        var wrapperTop = wrapper.offsetTop;
        var scrollable = wrapper.offsetHeight - window.innerHeight;

        // Each panel gets a third of the scroll range
        // Target the middle of each zone so it feels centered
        var targetProgress;
        if (index === 0) targetProgress = 0.15;      // BREATH — near start
        else if (index === 1) targetProgress = 0.5;   // SOUND — middle
        else targetProgress = 0.85;                    // VIBRATION — near end

        var targetScroll = wrapperTop + (scrollable * targetProgress);

        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      });
    });

    // ── Initialize ──
    setActivePanel(0);
    onScroll();
  })();

})();


// ═══ COMMUNITY SECTION — SCROLL-DRIVEN BEAT SWITCHING ═══
(function() {
  var wrapper = document.querySelector('.community-wrapper');
  var beats = document.querySelectorAll('.community-beat');

  if (!wrapper || !beats.length) return;

  var totalBeats = beats.length;
  var currentBeat = -1;

  function setActiveBeat(index) {
    if (index === currentBeat) return;
    currentBeat = index;

    beats.forEach(function(beat, i) {
      if (i === index) {
        beat.classList.add('visible');
      } else {
        beat.classList.remove('visible');
      }
    });
  }

  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var rect = wrapper.getBoundingClientRect();
        var viewportHeight = window.innerHeight;

        if (rect.bottom < 0 || rect.top > viewportHeight) {
          ticking = false;
          return;
        }

        var scrolled = -rect.top;
        var scrollable = rect.height - viewportHeight;
        if (scrollable <= 0) { ticking = false; return; }

        var progress = Math.max(0, Math.min(1, scrolled / scrollable));

        // 3 beats
        var zone = Math.min(totalBeats - 1, Math.floor(progress * totalBeats));
        setActiveBeat(zone);

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initialize — show beat 1
  setActiveBeat(0);
})();
