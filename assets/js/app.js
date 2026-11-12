/* ============================================================
   MZAZI TECH — core site behaviour + demo data layer
   ============================================================ */
(function () {
  "use strict";

  var K = {
    requests: "mzazi.requests.v1",
    messages: "mzazi.messages.v1",
    seeded: "mzazi.seeded.v1"
  };

  /* ---------- storage helpers ---------- */
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
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
      {
        id: uid("REQ"), name: "Daniel Mokoena", email: "d.mokoena@example.com", phone: "+27 82 555 0134",
        device: "Samsung Galaxy S23", service: "Android Device Diagnostics",
        message: "Screen flickers after the last update. Would like a diagnostic demonstration walkthrough.",
        status: "pending", createdAt: daysAgo(0)
      },
      {
        id: uid("REQ"), name: "Amina Yusuf", email: "amina.yusuf@example.com", phone: "+254 712 555 018",
        device: "Google Pixel 7a", service: "Device Lock Status Checker (simulation)",
        message: "Interested in how the lock-status report is structured for a device audit.",
        status: "contacted", createdAt: daysAgo(1)
      },
      {
        id: uid("REQ"), name: "Tariro Ndlovu", email: "t.ndlovu@example.com", phone: "+263 77 555 0142",
        device: "Xiaomi Redmi Note 12", service: "Android Security Testing",
        message: "Our team would like a short demo of the security testing workflow.",
        status: "completed", createdAt: daysAgo(3)
      },
      {
        id: uid("REQ"), name: "Kwame Mensah", email: "k.mensah@example.com", phone: "+233 24 555 0177",
        device: "Tecno Camon 20", service: "IMEI Information Checker (demo)",
        message: "Requesting a sample IMEI report format for training material.",
        status: "pending", createdAt: daysAgo(5)
      },
      {
        id: uid("REQ"), name: "Lerato Dube", email: "lerato.dube@example.com", phone: "+27 71 555 0192",
        device: "iPhone 13", service: "Device Diagnostics",
        message: "Looking for a device health overview demonstration.",
        status: "closed", createdAt: daysAgo(9)
      }
    ];
    write(K.requests, samples);
    write(K.seeded, true);
  }

  function getRequests() { return read(K.requests, []); }
  function saveRequests(list) { return write(K.requests, list); }
  function getMessages() { return read(K.messages, []); }
  function saveMessages(list) { return write(K.messages, list); }

  function addRequest(data) {
    var list = getRequests();
    var item = {
      id: uid("REQ"),
      name: data.name,
      email: data.email,
      phone: data.phone || "—",
      device: data.device || "Not specified",
      service: data.service || "General enquiry",
      message: data.message || "",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    saveRequests(list);
    return item;
  }

  function addMessage(data) {
    var list = getMessages();
    var item = {
      id: uid("MSG"),
      name: data.name,
      email: data.email,
      subject: data.subject || "General enquiry",
      message: data.message || "",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    saveMessages(list);
    return item;
  }

  window.MZAZI = {
    getRequests: getRequests,
    saveRequests: saveRequests,
    getMessages: getMessages,
    saveMessages: saveMessages,
    addRequest: addRequest,
    addMessage: addMessage,
    seed: seed,
    uid: uid
  };

  seed();

  /* ---------- header ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 8);
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
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
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
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
        var start = performance.now();
        var dur = 1200;
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-US");
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

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
  var toastEl = null;
  var toastTimer = null;

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

  function succeed(form, id, kind) {
    var box = form.querySelector(".form-status");
    if (box) {
      box.className = "form-status is-on";
      box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span><strong>' +
        (kind === "message" ? "Message received." : "Demo request logged.") +
        "</strong> Reference <strong>" + id + "</strong>. " +
        (kind === "message"
          ? "Our team replies within one business day."
          : "This is a demonstration workflow — no real service order was created.") +
        "</span>";
    }
    form.reset();
    window.mzaziToast(kind === "message" ? "Message received — demo only" : "Demo request saved — demo only");
    return true;
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
  }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var kind = form.getAttribute("data-form");
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });

      if (!data.name || data.name.length < 2) return fail(form, "Please enter your full name.");
      if (!validEmail(data.email || "")) return fail(form, "Please enter a valid email address.");
      if (kind === "demo" && !data.device) return fail(form, "Add the device model or serial identifier.");
      if (kind === "message" && (!data.message || data.message.length < 10)) {
        return fail(form, "Please add a few details so we can route your message.");
      }
      if (!form.querySelector('input[name="consent"]') || !form.querySelector('input[name="consent"]').checked) {
        return fail(form, "Please confirm that you understand this is a demonstration website.");
      }

      var item = kind === "demo" ? window.MZAZI.addRequest(data) : window.MZAZI.addMessage(data);
      succeed(form, item.id, kind === "message" ? "message" : "demo");
    });
  });

  /* ---------- year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
