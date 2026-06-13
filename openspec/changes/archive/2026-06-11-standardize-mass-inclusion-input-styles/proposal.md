## Why

The application currently has inconsistent or overly compact input and select fields (such as those adopted from the dashboard). The user has requested that all inputs, selects, and readonly output fields across all screens align with the style originally used on the "mass inclusion" screen. This style is more spacious, utilizing taller inputs (`py-2.5 px-3`), `rounded-lg` borders, and standard `text-sm` typography. Reverting or unifying to this design will improve usability, touch target sizes, and readability.

## What Changes

- **Shared Input Styling**: Update the shared `<app-input>` component's template and styles (label, input field, focus states, and disabled/readonly states) to match the mass inclusion design (larger padding, rounded-lg, standard text sizes, and slate-50 backgrounds).
- **Shared Select Styling**: Update the shared `<app-select>` component's template and styles to reflect the spacious mass inclusion select behavior and padding.
- **Shared Textarea Styling**: Update `<app-textarea>` to match the same spacious styling.
- **Unified Disabled/Readonly states (Outputs)**: Ensure fields displaying static or disabled data (such as user details on the settings page) are styled consistently using the new spacious read-only style.

## Capabilities

### New Capabilities
- `ui-input-select-mass-inclusion-style`: Standardize input, textarea, and select styling to match the spacious `rounded-lg`, `py-2.5` design from the mass inclusion form.

### Modified Capabilities
*None*

## Impact

- **Shared UI Components**:
  - `src/app/shared/components/input/input.ts`
  - `src/app/shared/components/select/select.ts`
  - `src/app/shared/components/textarea/textarea.ts`
- **Views**:
  - `src/app/ui/views/authentication/login/login.html`
  - `src/app/ui/views/settings/settings.html`
  - `src/app/ui/views/users/users.html`
  - `src/app/ui/components/mass-inclusion/mass-inclusion-form/mass-inclusion-form.html`
  - `src/app/ui/views/dashboard/components/dashboard-filters-panel.ts` (needs alignment to the new global style if required, though the request asks to apply it globally).
