import { Component, computed, inject, input } from '@angular/core';
import { ControlContainer, FormControl, FormGroup } from '@angular/forms';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-custom-validation-message',
  imports: [MessageModule],
  template: `
    <ul id="messages" [hidden]="!(control() && control().invalid && control().touched)">
      @if (control().hasError('required')) {
        <p-message severity="error" variant="simple" class="mt-[3px] flex items-start">
          <span class="text-sm" id="required">Este Campo é obrigatório!</span>
        </p-message>
      }
      @if (control().hasError('email')) {
        <p-message severity="error" variant="simple" class="mt-[3px] flex items-start">
          <span class="text-sm" id="email">Endereço de E-mail inválido!</span>
        </p-message>
      }
      @if (control().hasError('minlength') && minLength()) {
        <p-message severity="error" variant="simple" class="mt-[3px] flex items-start">
          <span class="text-sm" id="minLength"
            >Este campo deve ter ao menos {{ minLength() }} caracteres!</span
          >
        </p-message>
      }
      @if (control().hasError('maxlength') && maxLength()) {
        <p-message severity="error" variant="simple" class="mt-[3px] flex items-start">
          <span class="text-sm" id="maxLength"
            >Este campo deve ter no máximo {{ maxLength() }} caracteres!</span
          >
        </p-message>
      }
      @if (control().hasError('pattern')) {
        <p-message severity="error" variant="simple" class="mt-[3px] flex items-start">
          <span class="text-sm" id="pattern">Padrão inválido!</span>
        </p-message>
      }
    </ul>
  `,
  styles: [
    `
      ul {
        padding: 0;
        margin: 0;
      }
    `,
  ],
})
export class CustomValidationMessageComponent {
  public controlName = input.required<string>();

  public minLength = input<number>();

  public maxLength = input<number>();

  public controlContainer = inject(ControlContainer);

  public control = computed(() => {
    return (this.controlContainer.control as FormGroup).get(this.controlName()) as FormControl;
  });
}
