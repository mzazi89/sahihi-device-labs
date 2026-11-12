/* ============================================================
   SAHIHI — service pre-check (browser-side guidance only)
   Does not contact a device, carrier or financing provider.
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
      label: "Device model or lock type",
      hint: "Include the financier or carrier if you know it, e.g. “Watu lock” or “carrier lock”.",
      placeholder: "e.g. Galaxy S23 / M-KOPA lock",
      steps: ["Reading request", "Classifying lock type", "Matching service route", "Preparing document checklist"]
    },
    imei: {
      label: "IMEI (15 digits)",
      hint: "Dial *#06# to display it. Validation runs locally — nothing is transmitted.",
      placeholder: "e.g. 353918082379567",
      steps: ["Reading request", "Parsing IMEI structure", "Running checksum routine", "Preparing result"]
    }
  };

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

  function luhn(d14, check) {
    var sum = 0;
    for (var i = 0; i < 14; i++) {
      var d = parseInt(d14.charAt(i), 10);
      if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    return (10 - (sum % 10)) % 10 === parseInt(check, 10);
  }

  function classify(raw) {
    var s = raw.toLowerCase();
    if (/frp|google account|activation lock|bypass/.test(s)) {
      return {
        route: "Account protection — not removable",
        docs: "Proof of purchase, ID, original account details",
        time: "Manufacturer case only",
        note: "Factory Reset Protection exists to stop stolen devices being reused. We do not remove it. Bring proof of purchase and we will help you contact the manufacturer.",
        declined: true
      };
    }
    if (/m-?kopa|watu|mogo|onphone|sun ?king|finance|financed|installment|installment|loan/.test(s)) {
      return {
        route: "Financing lock release",
        docs: "Provider statement showing settled account, receipt, ID",
        time: "5–10 working days after provider accepts",
        note: "The lock is released by the financier, not by us. We prepare the file and follow up once the account is confirmed settled.",
        declined: false
      };
    }
    if (/carrier|network|safaricom|airtel|telkom|orange|sim lock/.test(s)) {
      return {
        route: "Carrier unlock",
        docs: "Receipt, contract status, ID",
        time: "3–7 working days",
        note: "We confirm eligibility with the carrier, submit the request and hand you the written confirmation.",
        declined: false
      };
    }
    if (/tablet|ipad|tab/.test(s)) {
      return {
        route: "Diagnostics & lock report",
        docs: "Receipt or provider statement, ID",
        time: "Same day at the desk",
        note: "Bring the tablet in for a diagnostic sheet and a lock-status report. Ownership is verified before any work.",
        declined: false
      };
    }
    return {
      route: "Diagnostics & lock report",
      docs: "Receipt or provider statement, ID",
      time: "Same day at the desk",
      note: "Start with a diagnostic assessment. We will confirm the lock type on the bench and route it from there.",
      declined: false
    };
  }

  function lockResult(raw) {
    var c = classify(raw);
    var ref = "SD-" + Math.floor(2000 + Math.random() * 7000);
    return {
      title: "Pre-check summary",
      badge: c.declined ? "REVIEW" : "ROUTE",
      rows: [
        ["Reference", ref],
        ["Request", esc(raw)],
        ["Service route", c.route],
        ["Documents to bring", c.docs],
        ["Typical turnaround", c.time]
      ],
      note: c.note,
      foot: "Guidance only — no device, carrier or financing provider was contacted. Eligibility is confirmed after document verification."
    };
  }

  function imeiResult(digits, raw) {
    var valid = luhn(digits.slice(0, 14), digits.slice(14));
    return {
      title: "IMEI structure check",
      badge: valid ? "VALID FORMAT" : "CHECK DIGIT",
      rows: [
        ["Input", esc(raw)],
        ["TAC (first 8)", digits.slice(0, 8)],
        ["Serial segment", digits.slice(8, 14)],
        ["Check digit", digits.slice(14)],
        ["Luhn checksum", valid ? "Passes local checksum" : "Fails local checksum"],
        ["Ownership status", "Confirmed at verification"]
      ],
      note: valid
        ? "The number is structurally valid. That does not prove ownership or clear a lock — bring the receipt or provider statement to verification."
        : "The check digit does not match the rest of the number. Re-read it from Settings → About phone, or dial *#06#.",
      foot: "Calculated in your browser. No blacklist, carrier or ownership database was queried."
    };
  }

  function render(r) {
    result.innerHTML =
      '<div class="result-head"><h4>' + r.title + '</h4><span class="badge badge--blue">' + r.badge + '</span></div>' +
      '<div class="result-rows">' + r.rows.map(function (row, i) {
        return '<div class="result-row"><span>' + row[0] + '</span><b class="' + (i === 0 ? "mono" : "") + '">' + row[1] + "</b></div>";
      }).join("") + "</div>" +
      '<div class="result-foot">' + r.note + "<br><br>" + r.foot + "</div>";
    result.classList.add("is-on");
  }

  function error(msg) {
    result.innerHTML =
      '<div class="result-head"><h4>Input needed</h4><span class="badge">NOT RUN</span></div>' +
      '<div class="result-rows"><div class="result-row"><span>Status</span><b>' + esc(msg) + "</b></div></div>" +
      '<div class="result-foot">Adjust the input and run the pre-check again.</div>';
    result.classList.add("is-on");
  }

  runBtn.addEventListener("click", function () {
    if (busy) return;
    var raw = input.value.trim();
    if (!raw) return error("Enter a device model or IMEI to continue.");

    if (mode === "imei") {
      var digits = raw.replace(/[\s-]/g, "");
      if (!/^\d{15}$/.test(digits)) return error("An IMEI must contain exactly 15 digits.");
    } else if (raw.length < 3) {
      return error("Use at least 3 characters, e.g. a model or lock type.");
    }

    busy = true;
    runBtn.setAttribute("disabled", "true");
    runBtn.textContent = "Checking…";
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
        line.textContent = steps[i];
        log.appendChild(line);
        i++;
        setTimeout(next, 420 + Math.random() * 200);
        return;
      }
      if (mode === "imei") {
        var d = raw.replace(/[\s-]/g, "");
        render(imeiResult(d, raw));
      } else {
        render(lockResult(raw));
      }
      busy = false;
      runBtn.removeAttribute("disabled");
      runBtn.innerHTML = runHtml;
      window.sahihiToast && window.sahihiToast("Pre-check ready");
    }

    setTimeout(next, 200);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); runBtn.click(); }
  });

  setMode("lock");
})();
