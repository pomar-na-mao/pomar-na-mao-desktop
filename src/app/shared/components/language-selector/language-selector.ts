import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-selector">
      <button 
        class="language-selector__btn" 
        (click)="toggleOverlay()" 
        [attr.aria-label]="'LAYOUT.LANGUAGES.' + (currentLang() | uppercase) | translate"
      >
        <img [src]="getFlagPath(currentLang())" alt="flag" class="language-selector__flag" />
      </button>

      @if (isOverlayOpen()) {
        <div class="language-selector__overlay">
          <button 
            class="language-selector__option" 
            [class.language-selector__option--active]="currentLang() === 'pt'"
            (click)="selectLanguage('pt')"
          >
            <img src="assets/images/brazil.png" alt="br" class="language-selector__option-flag" />
            <span>{{ 'LAYOUT.LANGUAGES.PT' | translate }}</span>
          </button>
          <button 
            class="language-selector__option" 
            [class.language-selector__option--active]="currentLang() === 'en'"
            (click)="selectLanguage('en')"
          >
            <img src="assets/images/usa.png" alt="us" class="language-selector__option-flag" />
            <span>{{ 'LAYOUT.LANGUAGES.EN' | translate }}</span>
          </button>
        </div>
        
        <!-- Backdrop to close on click outside -->
        <div class="language-selector__backdrop" (click)="closeOverlay()"></div>
      }
    </div>
  `,
  styles: [`
    .language-selector {
      position: relative;
      display: flex;
      align-items: center;
      margin-left: 8px;

      &__btn {
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--color-outline-variant);
        border-radius: 50%;
        background: var(--color-surface-container-high);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: all 0.2s ease;

        &:hover {
          background: var(--color-primary-container);
          border-color: var(--color-primary);
        }
      }

      &__flag {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &__overlay {
        position: absolute;
        top: calc(100% + 12px);
        right: 0;
        background: var(--color-surface-container-highest);
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--color-outline-variant);
        padding: 8px;
        min-width: 170px;
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: 4px;
        animation: slideIn 0.2s ease-out;
      }

      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      &__option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: var(--color-on-surface);
        text-align: left;
        transition: all 0.15s ease;

        &:hover {
          background: var(--color-surface-container-high);
          border-color: var(--color-outline-variant);
        }

        &--active {
          background: var(--color-primary-container);
          color: var(--color-on-primary-container);
          border-color: var(--color-primary);
        }
      }

      &__option-flag {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid var(--color-outline-variant);
      }

      &__backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 90;
      }
    }
  `]
})
export class LanguageSelector {
  private translate = inject(TranslateService);

  public isOverlayOpen = signal(false);
  public currentLang = signal(this.translate.currentLang || this.translate.getDefaultLang() || 'pt');

  public toggleOverlay() {
    this.isOverlayOpen.update(v => !v);
  }

  public closeOverlay() {
    this.isOverlayOpen.set(false);
  }

  public selectLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    this.closeOverlay();
  }

  public getFlagPath(lang: string): string {
    return lang === 'pt' ? 'assets/images/brazil.png' : 'assets/images/usa.png';
  }
}
