## Context

The current login screen needs a UI refresh to improve aesthetics. The goal is to create a modern, responsive, split-screen layout with an image on the left and the login form on the right.

## Goals / Non-Goals

**Goals:**
- Implement a split-screen login layout using Tailwind CSS.
- Ensure the right-side form container occupies exactly 40% of the screen width on desktop viewports (`lg` and above).
- Ensure the left-side image container occupies the remaining 60% of the screen width on desktop viewports.
- Use `src/assets/images/logo.png` within the left-side container.
- Make the layout fully responsive (e.g., image hidden or stacked on smaller screens, form taking 100% width).
- Apply modern design aesthetics consistent with the project's standards.

**Non-Goals:**
- Changes to the authentication logic or backend integration.
- Adding new login methods (e.g., OAuth, SSO).

## Decisions

- **Layout Structure:** Use a full-height Flexbox container (`min-h-screen flex`).
- **Responsive Behavior:** 
  - On desktop (`lg` and above), the screen will be split: `lg:w-[60%]` for the left side and `lg:w-[40%]` for the right side.
  - On small screens (`< lg`), the left-side container will be hidden (`hidden lg:flex`), and the form will take full width (`w-full`). A smaller version of the logo will be added above the form for mobile users.
- **Image Integration:** To ensure the logo looks good and isn't stretched, the left side will feature a visually pleasing background (e.g., a modern subtle gradient or pattern) with the `logo.png` perfectly centered inside it.

## Risks / Trade-offs

- **Image Scaling:** The logo might not look good if stretched across 60% of the screen. 
  *Mitigation:* Use the logo centered at a fixed or constrained size within a stylized background container rather than stretching the image to fill the entire 60% area.
