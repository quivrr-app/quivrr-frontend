# Retailer Partnership And Regional Retailer Network

## Purpose

This note documents the live frontend behaviour added during Sprint 13.5 so later regional coverage work does not accidentally undo it.

## Public retailer partnership page

The public retailer partnership page lives at:

- `/retailers/`

It exists to give surf retailers a clear public path to contact Quivrr about participating in the retailer network.

Current behaviour:

- hero heading: `Partner with Quivrr`
- CTA: `List my surf shop`
- benefits and fit sections explain the current product and commercial direction
- enquiry form fields:
  - shop name
  - website
  - region
  - contact name
  - contact email
  - message
- submission is currently a client-side prefilled `mailto:` handoff
- the destination email address is not shown in the visible UI

This page is static-frontend only. It does not currently post to a backend form endpoint or third-party SaaS form handler.

## Regional search page behaviour

The live regional search pages are:

- `/australia/`
- `/europe/`
- `/indonesia/`
- `/united-states/`

Each page now has:

- `Explore the world`
- `Partner with Quivrr`
- theme toggle

in the hero action cluster.

## Logo band contract

Two different strips now exist and they serve different purposes:

### Hero manufacturer band

The hero logo band remains manufacturer-focused.

Purpose:

- supported searchable brands
- manufacturer trust signal

Do not replace the hero band with retailers unless a future design brief explicitly changes that contract.

### Lower regional retailer network band

The lower strip above `Close matches` is the Regional Retailer Network.

Purpose:

- regional retailer trust signal
- visible proof of retailer coverage in that region

Each regional page must show only retailers from that region.

## Data source

Regional retailer-network data is maintained in:

- `regional-retailer-network.js`

This file is the shared source for:

- Australia
- Europe
- Indonesia
- United States

Update the shared file instead of hardcoding retailer names independently inside each region page.

## Logo card rules

Retailer cards keep a fixed size and shared animation behaviour.

Current treatment:

- logos that already present well on a white card remain on a white card
- transparent or white-on-transparent logos can render on a dark card
- text-only retailer entries always render as white text on a dark card
- no inversion
- no recolouring
- no outlines or strokes

Known explicit dark-card overrides currently exist for:

- `Onboard Store`
- `Onboard Store Indonesia`
- `Powerhouse Surf`

These overrides exist because the live production render needs deterministic treatment for a few transparent assets even when generic image analysis is timing-sensitive.

## Safe change guidelines

When adjusting this surface:

- do not change the regional search API behaviour from the frontend side
- do not move the retailer network back into the hero band
- do not expose the retailer enquiry destination email in visible UI
- keep light-mode branding stable unless the design brief explicitly says otherwise
- keep the Operations Centre separate from retailer-marketing changes
