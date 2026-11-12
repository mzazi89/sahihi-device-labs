/* ============================================================
   MZAZI TECH — site behaviour + service request store
   ============================================================ */
(function () {
  "use strict";

  var K = {
    requests: "mzazi.requests.v2",
    seeded: "mzazi.seeded.v2"
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  function uid(prefix) {
    var n = Math.random().toString(36).slice(2, 7).toUpperCase();
    return (prefix || "MZ") + "-" + new Date().getFullYear() + "-" + n;
  }

  function daysAgo(d) {
    var t = new Date();
    t.setDate(t.getDate() - d);
    t.setHours(9 + (d % 8), (d * 7) % 60, 0, 0);
    return t.toISOString();
  }

  function seed() {
    if (read(K.seeded, false)) return;
    var samples = [
      { id: uid("MZ"), name: "Daniel Mokoena", email: "d.mokoena@example.com", phone: "+254 712 555 034",
        deviceType: "Smartphone", device: "Samsung Galaxy S23", imei: "", finance: "None — device is fully owned",
        service: "Android Device Diagnostics", message: "Screen flickers after the last update. Needs a diagnostic sheet for a resale.",
        status: "pending", createdAt: daysAgo(0) },
      { id: uid("MZ"), name: "Amina Yusuf", email: "amina.yusuf@example.com", phone: "+254 733 555 018",
        deviceType: "Smartphone", device: "Google Pixel 7a", imei: "353918082379567", finance: "M-KOPA",
        service: "Financing Lock Release Support", message: "Handset is fully paid. M-KOPA statement attached — requesting release.",
        status: "contacted", createdAt: daysAgo(1) },
      { id: uid("MZ"), name: "Tariro Ndlovu", email: "t.ndlovu@example.com", phone: "+263 77 555 014",
        deviceType: "Smartphone", device: "Xiaomi Redmi Note 12", imei: "", finance: "Watu Credit",
        service: "Device Lock Status Report", message: "Bought second-hand. Need a lock-status report before I pay the balance.",
        status: "completed", createdAt: daysAgo(3) },
      { id: uid("MZ"), name: "Kwame Mensah", email: "k.mensah@example.com", phone: "+233 24 555 017",
        deviceType: "Tablet", device: "Samsung Galaxy Tab A8", imei: "", finance: "None — device is fully owned",
        service: "IMEI & Ownership Verification", message: "IMEI on the box does not match the one in settings. Need this checked.",
        status: "pending", createdAt: daysAgo(5) },
      { id: uid("MZ"), name: "Lerato Dube", email: "lerato.dube@example.com", phone: "+254 701 555 092",
        deviceType: "Smartphone", device: "Tecno Camon 20", imei: "", finance: "OnPhone",
        service: "Carrier Unlocking", message: "Contract ended last month. Requesting network unlock.",
        status: "closed", createdAt: daysAgo(9) },
      { id: uid("MZ"), name: "Peter Otieno", email: "p.otieno@example.com", phone: "+254 720 555 011",
        deviceType: "MiFi / Router", device: "Sun King Home Router", imei: "", finance: "Sun King",
        service: "Financing Lock Release Support", message: "Account settled in September. Need the device released for resale.",
        status: "completed", createdAt: daysAgo(12) }
    ];
    write(K.requests, samples);
    write(K.seeded, true);
  }

  function getRequests() { return read(K.requests, []); }
  function saveRequests(list) { return write(K.requests, list); }

  function addRequest(data) {
    var list = getRequests();
    var item = {
      id: uid("MZ"),
      name: data.name,
      email: data.email,
      phone: data.phone || "—",
      deviceType: data.deviceType || "Not specified",
      device: data.device || "Not specified",
      imei: data.imei || "",
      finance: data.finance || "None — device is fully owned",
      service: data.service || "General enquiry",
      message: data.message || "",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    saveRequests(list);
    return item;
  }

  window.MZAZI = { getRequests: getRequests, saveRequests: saveRequests, addRequest: addRequest, seed: seed, uid: uid };
  seed();

  /* ---------- header ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    document.body.classList.remove("menu-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = !document.body.classList.contains("menu-open");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* ---------- reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 6, 5) * 55) + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- counters ---------- */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  /* ---------- accordion ---------- */
  document.querySelectorAll(".acc-item").forEach(function (item) {
    var btn = item.querySelector(".acc-btn");
    var panel = item.querySelector(".acc-panel");
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      var group = item.closest(".accordion");
      if (group) {
        group.querySelectorAll(".acc-item.is-open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("is-open");
            other.querySelector(".acc-panel").style.maxHeight = "0px";
            other.querySelector(".acc-btn").setAttribute("aria-expanded", "false");
          }
        });
      }
      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : "0px";
    });
  });

  /* ---------- toast ---------- */
  var toastEl = null, toastTimer = null;
  window.mzaziToast = function (text) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    requestAnimationFrame(function () { toastEl.classList.add("is-on"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 3200);
  };

  /* ---------- forms ---------- */
  function fail(form, text) {
    var box = form.querySelector(".form-status");
    if (!box) return false;
    box.className = "form-status is-on is-error";
    box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01" stroke-linecap="round"/></svg><span>' + text + "</span>";
    return false;
  }

  function succeed(form, id) {
    var box = form.querySelector(".form-status");
    if (box) {
      box.className = "form-status is-on";
      box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span><strong>Request received.</strong> Your reference is <strong>' + id + '</strong>. Our desk replies within one business day with the document checklist.</span>';
    }
    form.reset();
    window.mzaziToast("Request received — reference " + id);
    return true;
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v); }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });

      if (!data.name || data.name.length < 2) return fail(form, "Please enter your full name.");
      if (!validEmail(data.email || "")) return fail(form, "Please enter a valid email address.");
      if (!data.deviceType) return fail(form, "Select the device type.");
      if (!data.device) return fail(form, "Add the device brand and model.");
      if (data.imei && !/^[\d\s-]{15,19}$/.test(data.imei)) return fail(form, "An IMEI has 15 digits. Leave it blank if you do not have it.");
      var consent = form.querySelector('input[name="consent"]');
      if (!consent || !consent.checked) return fail(form, "Please confirm ownership and consent to verification.");

      var item = window.MZAZI.addRequest(data);
      succeed(form, item.id);
    });
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
