# MZAZI TECH UNLOCKING CENTER

Marketing site and staff intake dashboard for MZAZI TECH INC — a Nairobi device-solutions practice offering Android diagnostics, lock-status reporting, IMEI verification, security testing, carrier unlocking and financing lock release support.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Hero, trust indicators, six services, financing partners, service pre-check |
| `services.html` | Detailed service catalogue, engagement formats, partner network, boundaries |
| `how-it-works.html` | Intake → verification → scope → provider release → handover |
| `about.html` | Company story, values, practice areas |
| `faq.html` | Service, data-handling and eligibility questions |
| `contact.html` | Service request form (device type, model, IMEI, financing provider) |
| `admin.html` | Staff dashboard — access code `mzazi-admin` |

## Stack

Static HTML, CSS and vanilla JavaScript. No build step, no backend, no trackers. Requests are stored in the browser (`localStorage`) and can be exported as CSV from the dashboard.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Policy

The site does not offer, and the code does not implement, FRP removal, account bypass or circumvention of active carrier or financing locks. Lock release is described as a provider-authorised process requiring settled accounts and proof of ownership.
