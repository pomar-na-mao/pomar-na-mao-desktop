## 1. Login Component Layout Refactoring

- [x] 1.1 Update the root layout wrapper in the login component to use a full-height flex container (`min-h-screen flex`).
- [x] 1.2 Create the left-side decorative container configured to hide on mobile and occupy 60% on desktop (`hidden lg:flex lg:w-[60%]`).
- [x] 1.3 Add the application logo (`src/assets/images/logo.png`) centered within the left-side decorative container.
- [x] 1.4 Update the right-side form container to take full width on mobile and 40% on desktop (`w-full lg:w-[40%]`).
- [x] 1.5 Add a mobile-only logo above the login form that is visible on small screens and hidden on desktop (`block lg:hidden`).

## 2. Verification

- [x] 2.1 Verify the layout on desktop viewports to ensure the 60/40 split and proper logo alignment.
- [x] 2.2 Verify the layout on mobile viewports to ensure the large decorative container is hidden and the form takes 100% width.
