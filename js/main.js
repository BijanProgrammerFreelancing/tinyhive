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
});
