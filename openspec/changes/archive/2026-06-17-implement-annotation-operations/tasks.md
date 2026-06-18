## 1. Database and Schema

- [x] 1.1 Create the migration SQL file to define the `get_annotation_operations` RPC on the Supabase schema.
- [x] 1.2 Document the new `get_annotation_operations` RPC in `database.md` in the appropriate SQL and listing sections.

## 2. Frontend Services & Repositories

- [x] 2.1 Add `getAnnotationOperations` method in `OperationsService` using the newly created RPC.
- [x] 2.2 Add `annotationOperations` signal and `getAnnotationOperations` method in `OperationsRepository`.

## 3. Frontend View Model & UI Logic

- [x] 3.1 Update the effect in `OperationsViewModel` constructor to handle the `'anotacao'` operation type, calling `fetchAnnotationOperations` and clearing other states.
- [x] 3.2 Implement `fetchAnnotationOperations` in `OperationsViewModel` and link `annotationOperations` getter.
- [x] 3.3 Update map layer logic in `OperationsViewModel` to draw annotation plant markers by reusing the `drawInspectionPlants` method or adapting it to support both inspection and annotation operations.
- [x] 3.4 Ensure map marker selection triggers the same signals (`selectedInspectionDetails`, `selectedInspectionPlant`, etc.) so the existing details card displays the occurrences.

## 4. Frontend View & UI Components

- [x] 4.1 Verify that the "Anotação" option in `OperationsFiltersPanel` correctly sets the select state.
- [x] 4.2 Verify or update `OperationsMapDetailsCard` to handle/display the added occurrences correctly for annotations.

## 5. Testing & Verification

- [x] 5.1 Create unit tests for the new repository methods in `operations-repository.spec.ts`.
- [x] 5.2 Create unit tests for the view-model changes in `operations.view-model.spec.ts`.
- [x] 5.3 Run all frontend unit tests using `npm run test` to verify code correctness.
- [x] 5.4 Run local linter and typecheck using `npm run lint` to ensure no syntax/compilation issues.
