---
name: primeng-confirmation-buttons
description: Apply the project's PrimeNG button styling convention when creating or editing destructive confirmation dialogs that use ConfirmationService or p-confirmDialog.
---

# PrimeNG Confirmation Buttons

For every destructive PrimeNG confirmation dialog in this project:

- Use the reject action for **Cancelar** with only `rejectButtonProps: { outlined: true }`; do not set `severity` on this button.
- Use the accept action for the destructive operation, such as **Excluir**, with `acceptButtonProps: { severity: 'danger', outlined: true }`.
- Apply the convention consistently to individual and batch actions.
- Add or update a test that verifies both button-property objects in the confirmation configuration.

Prefer PrimeNG button properties over ad hoc CSS classes so the dialog follows the active theme.
