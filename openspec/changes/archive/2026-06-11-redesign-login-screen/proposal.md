## Why

The current login screen needs a UI refresh to improve aesthetics and user experience. A modern split-screen layout with an image on the left and the login form on the right will make the application look more professional and visually appealing.

## What Changes

- Redesign the login page layout to a split-screen design.
- The right side will display the login form, occupying 40% of the screen width on desktop.
- The left side will display an image, incorporating the logo from `src/assets/images/logo.png`.
- The layout will be fully responsive, ensuring it adapts smoothly to smaller screens (e.g., stacking or expanding the form on mobile).

## Capabilities

### New Capabilities
- `login-screen-ui`: Defines the visual layout, responsive behavior, and aesthetic requirements for the new split-screen login page.

### Modified Capabilities

## Impact

- Modifies the login view component layout and styling (e.g., `src/app/ui/views/login/login.view.ts` or equivalent).
- No backend or database changes are required.
