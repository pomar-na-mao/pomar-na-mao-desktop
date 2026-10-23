## MODIFIED Requirements

### Requirement: Spacious Label Styling
The application UI SHALL render labels for input, select, and textarea components using the shared compact label role.

#### Scenario: Rendering an input or select label
- **WHEN** an input, select, or textarea label is rendered on any screen
- **THEN** it MUST use a 12px font size, an 18px line height, medium or semibold weight, and the semantic label color for the active theme
- **THEN** required, optional, help, and error information MUST remain readable and programmatically associated with the control

### Requirement: Spacious Input and Textarea Styling
The application UI SHALL style text inputs and textareas with the shared compact field presentation while preserving their existing values, bindings, and validation behavior.

#### Scenario: Input field is displayed
- **WHEN** a text, email, password, date input, or textarea is displayed
- **THEN** it MUST use the shared field background, border, radius, typography, and horizontal padding tokens
- **THEN** a single-line field MUST use the compact 36px height for `sm` or 40px height for `md` on pointer-oriented layouts
- **THEN** a single-line field MUST retain a 44px minimum interactive height on narrow touch-oriented layouts
- **THEN** focus-visible MUST show the shared focus border and glow without changing layout dimensions

### Requirement: Spacious Select Styling
The application UI SHALL style native selects and custom dropdown triggers with the same compact dimensions and semantic states as text inputs.

#### Scenario: Select dropdown is displayed
- **WHEN** a native select or custom dropdown trigger is displayed
- **THEN** it MUST use the shared field height, background, border, radius, typography, padding, and focus treatment for its selected size
- **THEN** its chevron, selected value, optional color marker, and placeholder MUST remain aligned and legible
- **THEN** a custom dropdown list MUST remain keyboard reachable, expose selection state, and fit within the viewport through bounded height and scrolling

## ADDED Requirements

### Requirement: Form controls expose complete visual states
Shared input, select, dropdown, and textarea controls SHALL expose consistent default, hover, focus-visible, disabled, read-only, and error states in both themes.

#### Scenario: Control state changes
- **WHEN** a shared control becomes hovered, focused, disabled, read-only, or invalid
- **THEN** its semantic state MUST be visually distinguishable without changing the control's functional binding
- **THEN** an invalid control MUST expose an error border or glow and associated error text rather than relying on color alone

### Requirement: Form control visual API supports compact sizes
Shared form controls SHALL accept a visual size of `sm` or `md` without changing their ControlValueAccessor contract.

#### Scenario: Existing control is migrated
- **WHEN** an existing shared or native control is replaced by the global visual API
- **THEN** its value type, form control name, model binding, disabled state, blur/touched behavior, validation messages, and emitted events MUST remain equivalent

