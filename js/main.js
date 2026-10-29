document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  var backdrop = document.querySelector('.nav-backdrop');

  function setNav(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(!nav.classList.contains('open'));
    });
    if (backdrop) {
      backdrop.addEventListener('click', function () { setNav(false); });
    }
    // Close the drawer if the viewport grows back to desktop width
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && nav.classList.contains('open')) setNav(false);
    });
  }

  // Contact form (static demo submit handler)
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('form-status');
      var name = form.querySelector('#name').value.trim();
      var email = form.querySelector('#email').value.trim();
      var message = form.querySelector('#message').value.trim();

      if (!name || !email || !message) {
        status.textContent = 'Please fill in your name, email and message.';
        status.className = 'form-status show err';
        return;
      }

      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        status.textContent = 'Please enter a valid email address.';
        status.className = 'form-status show err';
        return;
      }

      status.textContent = 'Thanks! Your message has been sent — we will get back to you soon.';
      status.className = 'form-status show ok';
      form.reset();
    });
  }

  // Header search: slide-down panel + in-page find
  var searchToggle = document.getElementById('search-toggle');
  var searchPanel = document.getElementById('search-panel');
  var searchForm = document.getElementById('site-search-form');
  var searchInput = document.getElementById('site-search-input');

  function closeSearch() {
    searchPanel.classList.remove('open');
    searchToggle.setAttribute('aria-expanded', 'false');
  }

  function findInPage(term) {
    var lowerTerm = term.toLowerCase();
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent || parent.closest('script, style, .search-panel')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.toLowerCase().indexOf(lowerTerm) !== -1) {
        var el = node.parentElement;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('search-highlight');
        setTimeout(function () { el.classList.remove('search-highlight'); }, 1800);
        return true;
      }
    }
    return false;
  }

  if (searchToggle && searchPanel && searchForm && searchInput) {
    searchToggle.addEventListener('click', function () {
      var isOpen = searchPanel.classList.toggle('open');
      searchToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        setTimeout(function () { searchInput.focus(); }, 150);
      } else {
        searchInput.value = '';
      }
    });

    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var term = searchInput.value.trim();
      if (!term) return;

      if (!findInPage(term)) {
        searchInput.setCustomValidity('No matches found on this page for "' + term + '".');
        searchInput.reportValidity();
        setTimeout(function () { searchInput.setCustomValidity(''); }, 2500);
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (searchPanel && searchPanel.classList.contains('open')) closeSearch();
    if (nav && nav.classList.contains('open')) setNav(false);
  });

  // Flying bees: one Lottie player per .bee / .bg-bee element
  var bees = document.querySelectorAll('.bee, .bg-bee');
  if (bees.length && window.lottie && window.TINYHIVE_BEE) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Bees are hidden on small screens, so only start the ones that are actually visible
    function startVisibleBees() {
      bees.forEach(function (el) {
        if (el.dataset.beeStarted || !el.getClientRects().length) return;
        el.dataset.beeStarted = 'true';

        var anim = lottie.loadAnimation({
          container: el,
          renderer: 'svg',
          loop: true,
          autoplay: false,
          // lottie mutates its input, so each player gets its own copy
          animationData: JSON.parse(JSON.stringify(window.TINYHIVE_BEE))
        });
        // Random start frame and speed so the wings don't flap in sync
        var frame = Math.random() * anim.totalFrames;
        if (reduceMotion) {
          anim.goToAndStop(frame, true);
        } else {
          anim.setSpeed(0.85 + Math.random() * 0.3);
          anim.goToAndPlay(frame, true);
        }
      });
    }

    startVisibleBees();
    window.addEventListener('resize', startVisibleBees);

    // Scroll parallax: bigger bees read as closer, so they move faster.
    // Uses the `translate` property so it stacks with the CSS drift transform and .flip scale.
    if (!reduceMotion) {
      var ticking = false;

      function updateParallax() {
        ticking = false;
        var scrollY = window.scrollY;
        var vh = window.innerHeight;

        // Read all layout first, then write, to avoid layout thrashing
        var offsets = Array.prototype.map.call(bees, function (el) {
          var w = el.offsetWidth;
          if (!w) return null;

          if (el.classList.contains('bg-bee')) {
            // Fixed background bees: drift upward and wrap around the viewport,
            // so they keep flying past on long pages
            var h = el.offsetHeight;
            var range = vh + h;
            var y = el.offsetTop - scrollY * (w / 110) * 0.3;
            var wrapped = ((y + h) % range + range) % range - h;
            return wrapped - el.offsetTop;
          }
          // Hero bees scroll with the page; pull them up faster than the content
          return -scrollY * (w / 170) * 0.5;
        });

        bees.forEach(function (el, i) {
          if (offsets[i] !== null) el.style.translate = '0 ' + offsets[i].toFixed(1) + 'px';
        });
      }

      function requestParallax() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateParallax);
      }

      window.addEventListener('scroll', requestParallax, { passive: true });
      window.addEventListener('resize', requestParallax);
      updateParallax();
    }
  }
});
