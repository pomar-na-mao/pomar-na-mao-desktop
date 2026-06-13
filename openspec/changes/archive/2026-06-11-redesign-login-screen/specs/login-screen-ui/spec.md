## ADDED Requirements

### Requirement: Split-Screen Desktop Layout
The login page SHALL render a split-screen layout on desktop viewports.

#### Scenario: Displaying on a large screen
- **WHEN** the user navigates to the login screen on a viewport of size `lg` (1024px) or larger
- **THEN** the layout MUST be split horizontally into two sections
- **THEN** the left section MUST occupy exactly 60% of the screen width and display the application logo (`src/assets/images/logo.png`) centered within a stylized background
- **THEN** the right section MUST occupy exactly 40% of the screen width and display the login form

### Requirement: Responsive Mobile Layout
The login page SHALL adapt to smaller screens by prioritizing the form and adjusting the logo placement.

#### Scenario: Displaying on a small screen
- **WHEN** the user navigates to the login screen on a viewport smaller than `lg`
- **THEN** the large left-side decorative background container MUST be hidden
- **THEN** the login form container MUST expand to 100% of the screen width
- **THEN** the application logo MUST be displayed prominently above the login form inputs
