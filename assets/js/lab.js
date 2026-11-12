/* ============================================================
   MZAZI TECH — simulated device checker (front-end only)
   No network requests. No device is contacted. All output is
   fabricated demonstration data.
   ============================================================ */
(function () {
  "use strict";

  var root = document.getElementById("lab");
  if (!root) return;

  var tabs = root.querySelectorAll(".lab-tab");
  var input = document.getElementById("labInput");
  var label = document.getElementById("labLabel");
  var hint = document.getElementById("labHint");
  var runBtn = document.getElementById("labRun");
  var bar = document.getElementById("labProgress");
  var log = document.getElementById("labLog");
  var result = document.getElementById("labResult");
  var mode = "lock";
  var busy = false;
  var runHtml = runBtn.innerHTML;

  var copy = {
    lock: {
      label: "Device identifier or model",
      hint: "Try any model name or serial, e.g. “Galaxy S23” or “SN-88213-AA”.",
      placeholder: "e.g. Pixel 7a / SN-88213-AA",
      steps: [
        "Opening local simulation session",
        "Reading demonstration device profile",
        "Mapping lock-state reference table",
        "Composing demo report"
      ]
    },
    imei: {
      label: "IMEI (15 digits, demo input)",
      hint: "Use any 15-digit number. Nothing is transmitted or validated against a real database.",
      placeholder: "e.g. 353918082379567",
      steps: [
        "Opening local simulation session",
        "Parsing IMEI structure",
        "Running Luhn checksum routine",
        "Composing demo report"
      ]
    }
  };

  /* deterministic pseudo-random from a string */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pick(list, seed, salt) {
    return list[(seed + salt * 2654435761) % list.length];
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function setMode(next) {
    if (busy) return;
    mode = next;
    var c = copy[mode];
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-tab") === mode;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    label.textContent = c.label;
    hint.textContent = c.hint;
    input.setAttribute("placeholder", c.placeholder);
    input.value = "";
    result.classList.remove("is-on");
    result.innerHTML = "";
    log.classList.remove("is-on");
    log.innerHTML = "";
    bar.classList.remove("is-on");
    bar.querySelector("i").style.width = "0%";
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () { setMode(t.getAttribute("data-tab")); });
  });

  function luhnCheck(digits14, check) {
    var sum = 0;
    for (var i = 0; i < 14; i++) {
      var d = parseInt(digits14.charAt(i), 10);
      if (i % 2 === 1) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return (10 - (sum % 10)) % 10 === parseInt(check, 10);
  }

  function lockReport(seed, raw) {
    var models = ["Android handset (reference profile A)", "Android handset (reference profile B)", "Android handset (reference profile C)"];
    var boot = pick(["Reference: locked (demo)", "Reference: not in demo dataset"], seed, 3);
    var screen = pick(["PIN / pattern set (demo)", "No screen lock recorded (demo)"], seed, 7);
    var frp = pick(["Provisioned — no live check performed", "Provisioning state: unknown in demo"], seed, 11);

    return {
      title: "Lock status — simulated report",
      rows: [
        ["Input token", esc(raw)],
        ["Device class", pick(models, seed, 2)],
        ["Bootloader state", boot],
        ["Screen lock", screen],
        ["Factory reset protection", frp],
        ["Carrier lock", pick(["No carrier restriction found in sample", "Carrier profile not in demo dataset"], seed, 13)],
        ["Report basis", "Fabricated demo data"]
      ],
      foot: "No device was contacted, queried or modified. This output is generated in your browser for interface demonstration only."
    };
  }

  function imeiReport(digits, raw) {
    var seed = hash(digits);
    var tac = digits.slice(0, 8);
    var serial = digits.slice(8, 14);
    var check = digits.slice(14, 15);
    var valid = luhnCheck(digits.slice(0, 14), check);
    var models = [
      "Samsung Galaxy A-series (indicative)",
      "Google Pixel (indicative)",
      "Xiaomi Redmi (indicative)",
      "Tecno Spark (indicative)",
      "Nokia G-series (indicative)"
    ];

    return {
      title: "IMEI information — simulated report",
      rows: [
        ["Input", esc(raw)],
        ["TAC (first 8)", tac],
        ["Serial segment", serial],
        ["Check digit", check],
        ["Luhn checksum", valid ? "Passes local checksum" : "Fails local checksum"],
        ["Indicative model", pick(models, seed, 5)],
        ["Reporting status", "Not queried (demo)"],
        ["Report basis", "Locally computed demo data"]
      ],
      foot: "The checksum is calculated on your device and is not an ownership or authenticity verification. No database or network lookup is performed."
    };
  }

  function render(report) {
    result.innerHTML =
      '<div class="result-head"><h4>' + report.title + '</h4><span class="badge badge--demo">DEMO</span></div>' +
      '<div class="result-rows">' +
      report.rows.map(function (r, i) {
        return '<div class="result-row"><span>' + r[0] + '</span><b class="' + (i === 0 ? "mono" : "") + '">' + r[1] + "</b></div>";
      }).join("") +
      "</div>" +
      '<div class="result-foot">' + report.foot + "</div>" +
      '<span class="stamp">Simulated</span>';
    result.classList.add("is-on");
  }

  function error(msg) {
    result.innerHTML =
      '<div class="result-head"><h4>Input required</h4><span class="badge">NOT RUN</span></div>' +
      '<div class="result-rows"><div class="result-row"><span>Status</span><b>' + esc(msg) + "</b></div></div>" +
      '<div class="result-foot">Nothing was checked. Adjust the input and run the demonstration again.</div>';
    result.classList.add("is-on");
  }

  runBtn.addEventListener("click", function () {
    if (busy) return;
    var raw = input.value.trim();

    if (!raw) return error("Enter an identifier to continue.");

    if (mode === "imei") {
      var digits = raw.replace(/[\s-]/g, "");
      if (!/^\d{15}$/.test(digits)) {
        return error("An IMEI must contain exactly 15 digits.");
      }
    } else if (raw.length < 4) {
      return error("Use at least 4 characters for the demo identifier.");
    }

    busy = true;
    runBtn.setAttribute("disabled", "true");
    runBtn.textContent = "Running simulation…";
    result.classList.remove("is-on");
    log.innerHTML = "";
    log.classList.add("is-on");
    bar.classList.add("is-on");
    var fill = bar.querySelector("i");
    fill.style.width = "0%";

    var steps = copy[mode].steps;
    var i = 0;

    function next() {
      if (i < steps.length) {
        fill.style.width = Math.round(((i + 1) / steps.length) * 100) + "%";
        var line = document.createElement("div");
        line.className = "log-line";
        line.style.animationDelay = "0ms";
        line.textContent = steps[i];
        log.appendChild(line);
        i++;
        setTimeout(next, 480 + Math.random() * 220);
        return;
      }

      var report = mode === "imei"
        ? imeiReport(raw.replace(/[\s-]/g, ""), raw)
        : lockReport(hash(raw.toLowerCase()), raw);

      render(report);
      busy = false;
      runBtn.removeAttribute("disabled");
      runBtn.innerHTML = runHtml;
      window.mzaziToast && window.mzaziToast("Simulated result generated");
    }

    setTimeout(next, 220);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      runBtn.click();
    }
  });

  setMode("lock");
})();
