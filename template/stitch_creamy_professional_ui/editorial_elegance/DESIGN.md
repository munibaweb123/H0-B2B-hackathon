---
name: Editorial Elegance
colors:
  surface: '#fdf9ed'
  surface-dim: '#dddace'
  surface-bright: '#fdf9ed'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f4e7'
  surface-container: '#f1eee1'
  surface-container-high: '#ece8dc'
  surface-container-highest: '#e6e2d6'
  on-surface: '#1c1c14'
  on-surface-variant: '#464741'
  inverse-surface: '#313128'
  inverse-on-surface: '#f4f1e4'
  outline: '#777870'
  outline-variant: '#c7c7be'
  surface-tint: '#5d5f55'
  primary: '#5d5f55'
  on-primary: '#ffffff'
  primary-container: '#f6f7e9'
  on-primary-container: '#6f7166'
  inverse-primary: '#c6c8ba'
  secondary: '#7d4c84'
  on-secondary: '#ffffff'
  secondary-container: '#f9befd'
  on-secondary-container: '#78487f'
  tertiary: '#735b2b'
  on-tertiary: '#ffffff'
  tertiary-container: '#fff4e7'
  on-tertiary-container: '#866c3b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e4d6'
  primary-fixed-dim: '#c6c8ba'
  on-primary-fixed: '#1a1d14'
  on-primary-fixed-variant: '#45483e'
  secondary-fixed: '#ffd6ff'
  secondary-fixed-dim: '#eeb3f2'
  on-secondary-fixed: '#32053b'
  on-secondary-fixed-variant: '#63356a'
  tertiary-fixed: '#ffdea5'
  tertiary-fixed-dim: '#e2c289'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#594316'
  background: '#fdf9ed'
  on-background: '#1c1c14'
  surface-variant: '#e6e2d6'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1200px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system is built upon a foundation of intellectual sophistication and quiet luxury. It targets a discerning audience that values clarity, depth, and a premium editorial experience. The brand personality is authoritative yet welcoming, achieved through a "high-contrast minimalism" approach.

By pairing a warm, creamy substrate with a deep, regal plum, the UI avoids the sterile coldness of pure white/black palettes. This creates an emotional response of calm focus and reliability. The aesthetic draws from modern editorial design—prioritizing generous whitespace, intentional typographic hierarchy, and a restrained use of decorative elements to let the content lead.

## Colors

This palette is defined by its extreme tonal range and warmth. 

- **Primary/Surface (#F6F7E9):** This creamy off-white serves as the primary canvas. It reduces eye strain compared to pure white and provides a tactile, "paper-like" quality to the interface.
- **Secondary/Brand (#33063C):** This deep plum is used for primary actions, headings, and high-emphasis elements. It provides the necessary "anchor" for the light surface.
- **Surface Variants:** Use subtle shifts of the primary color (darkened by 2-5%) for container backgrounds to create depth without relying on shadows.
- **Action States:** Hover states for secondary elements should utilize a slight desaturation or a 10% opacity overlay of the neutral color to maintain the richness of the plum.
- **Contrast:** Ensure all text-on-surface pairings meet WCAG AA standards. Small text should primarily use the Secondary or Neutral colors for maximum legibility.

## Typography

The typography strategy relies on the interplay between a high-contrast Serif and a clean, functional Sans-Serif.

- **Headlines:** Playfair Display provides an editorial, sophisticated character. Use it for large-scale storytelling and page headers. 
- **Body:** DM Sans is chosen for its geometric clarity and readability at smaller sizes. Its low contrast complements the expressive nature of the serif headlines.
- **Rhythm:** Maintain a generous line height (1.6) for body text to reinforce the premium, breathable feel of the design system.
- **Labels:** Use uppercase styling for small labels and metadata to create a distinct visual texture that separates functional UI from narrative content.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for desktop to ensure content remains centered and readable, mimicking a high-end magazine layout.

- **Desktop:** A 12-column grid with 24px gutters. Page margins are wide (64px) to push the content into a focused central column.
- **Mobile:** A 4-column fluid grid. Margins scale down to 20px. 
- **Spacing Rhythm:** Use a strictly 8px-based increment system. Vertical rhythm is critical; ensure that spacing between sections is generous (e.g., 80px or 120px) to maintain the "Editorial" aesthetic.

## Elevation & Depth

This design system avoids heavy drop shadows in favor of **Tonal Layering** and **Low-Contrast Outlines**.

- **Tiers:** Depth is communicated by darkening the surface color. The base background is `#F6F7E9`. Elevated cards or sections use a slightly darker or lighter tint to create a "stacked paper" effect.
- **Shadows:** When necessary (e.g., for floating menus), use an "Ambient Shadow": very large blur (32px+), low opacity (5-8%), and tinted with the Secondary Plum color (#33063C) rather than pure black.
- **Borders:** Use thin, 1px borders in the Secondary color at 10-15% opacity to define boundaries without adding visual noise.

## Shapes

The shape language is **Soft (0.25rem)**. While the overall vibe is sophisticated, sharp corners feel too aggressive for the "creamy" color palette. 

- **Components:** Buttons and input fields use a 4px (0.25rem) corner radius.
- **Large Elements:** Featured images or large cards can scale up to 8px (0.5rem) to feel more substantial and modern.
- **Icons:** Use icons with a consistent stroke weight (1.5px or 2px) that match the roundedness of the UI components.

## Components

- **Buttons:** Primary buttons are solid Plum (#33063C) with Cream (#F6F7E9) text. Secondary buttons are "Ghost" style with a 1px Plum border and Plum text.
- **Inputs:** Use a bottom-border only or a very light 1px Plum-tinted border. The background should be a slightly darker version of the surface color to denote interactable areas.
- **Chips/Tags:** Use the Tertiary color (#A68A56) at low opacity with dark text for categorized metadata.
- **Cards:** Cards should be flat, defined by a subtle 1px border or a slight tonal shift in the background color. Do not use heavy shadows.
- **Lists:** Use generous vertical padding (16px-24px) between list items, separated by a thin, low-opacity Plum line to maintain editorial clarity.