/* ============================================================
   MZAZI TECH — admin dashboard (local demo data only)
   ============================================================ */
(function () {
  "use strict";

  var AUTH_KEY = "mzazi.admin.v1";
  var PASSCODE = "mzazi-demo";

  var gate = document.getElementById("adminGate");
  var gateForm = document.getElementById("gateForm");
  var gateMsg = document.getElementById("gateMsg");
  var shell = document.getElementById("adminShell");
  var tbody = document.getElementById("reqRows");
  var empty = document.getElementById("emptyState");
  var search = document.getElementById("adminSearch");
  var filter = document.getElementById("adminFilter");
  var detail = document.getElementById("detailPanel");
  var toast = window.mzaziToast || function () {};

  function isAuthed() {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch (e) { return false; }
  }

  function setAuthed(on) {
    try {
      if (on) sessionStorage.setItem(AUTH_KEY, "1");
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {}
    document.body.classList.toggle("is-authed", on);
    if (gate) gate.style.display = on ? "none" : "";
    if (shell) shell.classList.toggle("is-on", on);
  }

  if (gateForm) {
    gateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (document.getElementById("passcode").value || "").trim().toLowerCase();
      if (val === PASSCODE) {
        setAuthed(true);
        gateMsg.textContent = "";
        render();
        toast("Demo dashboard unlocked");
      } else {
        gateMsg.textContent = "Incorrect passcode. The demonstration passcode is shown below.";
      }
    });
  }

  document.querySelectorAll("[data-signout]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setAuthed(false);
      if (gateForm) gateForm.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast("Signed out of demo dashboard");
    });
  });

  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var hh = String(d.getHours()).padStart(2, "0");
    var mm = String(d.getMinutes()).padStart(2, "0");
    return d.getDate() + " " + months[d.getMonth()] + ", " + hh + ":" + mm;
  }

  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) {
      return p.charAt(0).toUpperCase();
    }).join("");
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  var STATUS_LABEL = {
    pending: "Pending",
    contacted: "Contacted",
    completed: "Completed",
    closed: "Closed"
  };

  function currentList() {
    var list = window.MZAZI.getRequests();
    var q = (search && search.value || "").trim().toLowerCase();
    var f = (filter && filter.value) || "all";

    return list.filter(function (r) {
      var matchQ = !q || [r.name, r.email, r.device, r.service, r.id].join(" ").toLowerCase().indexOf(q) > -1;
      var matchF = f === "all" || r.status === f;
      return matchQ && matchF;
    });
  }

  function renderKpis() {
    var list = window.MZAZI.getRequests();
    var total = list.length;
    var pending = list.filter(function (r) { return r.status === "pending"; }).length;
    var contacted = list.filter(function (r) { return r.status === "contacted"; }).length;
    var done = list.filter(function (r) { return r.status === "completed"; }).length;

    var map = { kpiTotal: total, kpiPending: pending, kpiContacted: contacted, kpiDone: done };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
  }

  function render() {
    if (!tbody) return;
    renderKpis();
    var list = currentList();
    var all = window.MZAZI.getRequests();

    tbody.innerHTML = list.map(function (r) {
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td class="cell-name"><div class="who"><span class="avatar">' + esc(initials(r.name)) + "</span><div><b>" + esc(r.name) + "</b><span>" + esc(r.id) + "</span></div></div></td>" +
        '<td data-label="Device" class="cell-row-2">' + esc(r.device) + "</td>" +
        '<td data-label="Service">' + esc(r.service) + "</td>" +
        '<td data-label="Received" class="cell-date">' + fmtDate(r.createdAt) + "</td>" +
        '<td data-label="Status" class="cell-status"><span class="status-pill status-' + esc(r.status) + '">' + esc(STATUS_LABEL[r.status] || r.status) + "</span></td>" +
        '<td class="cell-actions"><div class="row-actions">' +
          '<button class="icon-btn" data-act="view" title="View request" aria-label="View request from ' + esc(r.name) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>' +
          "</button>" +
          '<button class="icon-btn is-danger" data-act="delete" title="Delete request" aria-label="Delete request from ' + esc(r.name) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          "</button>" +
        "</div></td>" +
      "</tr>";
    }).join("");

    if (empty) empty.style.display = list.length ? "none" : "";
    if (!list.length && search && search.value) {
      empty.querySelector("strong").textContent = "No matching requests";
      empty.querySelector("span").textContent = "Try a different name, device, reference, or status filter.";
    } else if (empty) {
      empty.querySelector("strong").textContent = all.length ? "Nothing here yet" : "No demo requests yet";
      empty.querySelector("span").textContent = all.length
        ? "Adjust the filters to see other records."
        : "Requests submitted through the demo form will appear here instantly.";
    }
  }

  if (tbody) {
    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      var tr = btn.closest("tr");
      var id = tr.getAttribute("data-id");
      var list = window.MZAZI.getRequests();
      var item = list.filter(function (r) { return r.id === id; })[0];
      if (!item) return;

      if (btn.getAttribute("data-act") === "delete") {
        if (!window.confirm("Delete demonstration request " + id + "?")) return;
        window.MZAZI.saveRequests(list.filter(function (r) { return r.id !== id; }));
        detail.classList.remove("is-on");
        render();
        toast("Request removed");
        return;
      }

      detail.innerHTML =
        '<div class="detail-head"><div><span class="micro">' + esc(item.id) + "</span>" +
        '<h3 style="margin-top:5px">' + esc(item.name) + "</h3></div>" +
        '<span class="status-pill status-' + esc(item.status) + '">' + esc(STATUS_LABEL[item.status] || item.status) + "</span></div>" +
        '<div class="result-rows">' +
          '<div class="result-row"><span>Email</span><b>' + esc(item.email) + "</b></div>" +
          '<div class="result-row"><span>Phone</span><b>' + esc(item.phone) + "</b></div>" +
          '<div class="result-row"><span>Device</span><b>' + esc(item.device) + "</b></div>" +
          '<div class="result-row"><span>Service</span><b>' + esc(item.service) + "</b></div>" +
          '<div class="result-row"><span>Received</span><b>' + fmtDate(item.createdAt) + "</b></div>" +
        "</div>" +
        (item.message ? '<p style="margin-top:12px;padding-top:11px;border-top:1px solid rgba(143,178,255,.18)">“' + esc(item.message) + '”</p>' : "") +
        '<div class="field" style="margin-top:12px"><label for="detailStatus">Update status</label>' +
        '<select class="select" id="detailStatus" data-id="' + esc(item.id) + '">' +
          Object.keys(STATUS_LABEL).map(function (k) {
            return '<option value="' + k + '"' + (k === item.status ? " selected" : "") + ">" + STATUS_LABEL[k] + "</option>";
          }).join("") +
        "</select></div>" +
        '<p style="margin-top:8px;font-size:10px;color:var(--muted-2)">Demonstration record stored in this browser only. Do not treat as a real client request.</p>';
      detail.classList.add("is-on");
      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  if (detail) {
    detail.addEventListener("change", function (e) {
      if (e.target.id !== "detailStatus") return;
      var id = e.target.getAttribute("data-id");
      var val = e.target.value;
      var list = window.MZAZI.getRequests().map(function (r) {
        if (r.id === id) r.status = val;
        return r;
      });
      window.MZAZI.saveRequests(list);
      var pill = detail.querySelector(".detail-head .status-pill");
      if (pill) {
        pill.className = "status-pill status-" + val;
        pill.textContent = STATUS_LABEL[val] || val;
      }
      render();
      toast("Status updated (demo data)");
    });
  }

  if (search) search.addEventListener("input", render);
  if (filter) filter.addEventListener("change", render);

  var exportBtn = document.getElementById("exportCsv");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      var list = window.MZAZI.getRequests();
      if (!list.length) return toast("No records to export");
      var head = ["Reference", "Name", "Email", "Phone", "Device", "Service", "Status", "Received", "Message"];
      var rows = list.map(function (r) {
        return [r.id, r.name, r.email, r.phone, r.device, r.service, STATUS_LABEL[r.status] || r.status, r.createdAt, r.message];
      });
      var csv = [head].concat(rows).map(function (row) {
        return row.map(function (cell) {
          return '"' + String(cell == null ? "" : cell).replace(/"/g, '""') + '"';
        }).join(",");
      }).join("\r\n");

      var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "mzazi-demo-requests.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      toast("CSV exported (demo data)");
    });
  }

  var clearBtn = document.getElementById("clearData");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      if (!window.confirm("Clear all demonstration requests stored in this browser?")) return;
      window.MZAZI.saveRequests([]);
      detail.classList.remove("is-on");
      render();
      toast("Local demo data cleared");
    });
  }

  var seedBtn = document.getElementById("seedData");
  if (seedBtn) {
    seedBtn.addEventListener("click", function () {
      if (window.MZAZI.getRequests().length && !window.confirm("Add the sample records again?")) return;
      try { localStorage.removeItem("mzazi.seeded.v1"); } catch (e) {}
      window.MZAZI.seed();
      render();
      toast("Sample records restored");
    });
  }

  /* init */
  if (isAuthed()) {
    setAuthed(true);
    render();
  } else {
    setAuthed(false);
  }
})();
