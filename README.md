# MZAZI TECH UNLOCKING CENTER

A premium, mobile-first demonstration website for a fictional device-solutions studio — Android diagnostics, lock-status simulation, IMEI structure demos, security-testing education and a local admin dashboard.

**Fictional demonstration project.** No device is accessed, unlocked or modified. No payment, FRP or security bypass is implemented.

## Pages

- `index.html` — hero, trust indicators, services, interactive demo checker, process
- `services.html` — six service modules, engagement formats, ethical boundaries
- `how-it-works.html` — end-to-end demonstration workflow
- `about.html` — brand story, values, build notes
- `faq.html` — 12 answers incl. data handling and legal limits
- `contact.html` — demo request form (stored in browser localStorage)
- `admin.html` — request dashboard, demo passcode `mzazi-demo`

## Stack

Static HTML, CSS and vanilla JavaScript. No build step, no backend, no trackers. Demo requests persist in `localStorage`.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Any static host. No configuration required.
