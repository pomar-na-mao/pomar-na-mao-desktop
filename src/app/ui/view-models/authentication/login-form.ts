import { inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';

export type LoginFormControl = {
  email: FormControl<string>;
  password: FormControl<string>;
};

export function createLoginForm(): FormGroup<LoginFormControl> {
  const formBuilder = inject(NonNullableFormBuilder);

  return formBuilder.group({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),
  });
}

export type LoginFormGroup = ReturnType<typeof createLoginForm>;

export type LoginFormValue = ReturnType<LoginFormGroup['getRawValue']>;
