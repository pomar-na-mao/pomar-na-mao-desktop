# ui-input-select-mass-inclusion-style Specification

## ADDED Requirements

### Requirement: Spacious Label Styling
The application UI SHALL render labels for input, select, and textarea components with a standard `text-sm` size and `font-medium` weight.

#### Scenario: Rendering an input or select label
- **WHEN** an input, select, or textarea label is rendered on any screen
- **THEN** it MUST have a font size of 14px (`text-sm`) and medium font weight, using slate-700 color in light mode or slate-300 in dark mode.

### Requirement: Spacious Input and Textarea Styling
The application UI SHALL style text inputs and textareas with a spacious, rounded-lg container.

#### Scenario: Input field is displayed
- **WHEN** a text, email, password, date input, or textarea is displayed
- **THEN** it MUST render with a border radius of 0.5rem (`rounded-lg`), slate-200 border in light mode or slate-700 in dark mode, and a slate-50 background in light mode or slate-800 in dark mode.
- **THEN** it MUST render with a font size of 14px (`text-sm`) and padding-y of 2.5 (10px) and padding-x of 3 (12px) (or equivalent padding for icons).
- **THEN** on focus, it MUST show a focus ring with 2px width of emerald-500 and an emerald-500 border color.

### Requirement: Spacious Select Styling
The application UI SHALL style dropdown selects with the same spacious layout as inputs.

#### Scenario: Select dropdown is displayed
- **WHEN** a select dropdown is displayed
- **THEN** it MUST render with a border radius of 0.5rem (`rounded-lg`), slate-200 border in light mode or slate-700 in dark mode, slate-50 background in light mode or slate-800 in dark mode, font size of 14px (`text-sm`), padding-y of 2.5, and padding-x of 3.
- **THEN** on focus, it MUST show a focus ring with 2px width of emerald-500 and an emerald-500 border color.
