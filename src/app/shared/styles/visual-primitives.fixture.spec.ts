import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ButtonDirective } from '../directives/button/button.directive';

@Component({
  standalone: true,
  imports: [ButtonDirective],
  template: `
    <section class="ui-surface" data-testid="surface">
      <article class="ui-card" data-testid="card">Card</article>
      <div class="ui-alert" data-ui-status="info" role="status">Alerta</div>
      <nav class="ui-menu" aria-label="Menu de teste">
        <a class="ui-menu-item" href="#fixture">Item</a>
      </nav>
      <div role="tablist" aria-label="Abas de teste">
        <button class="ui-tab" role="tab" aria-selected="true">Ativa</button>
        <button class="ui-tab" role="tab" aria-selected="false">Inativa</button>
      </div>
      <div role="table"><div class="ui-table-row" role="row">Linha</div></div>
      <button class="ui-icon-button" aria-label="Ação de teste">+</button>
      <button appButton variant="primary">Primário</button>
      <button appButton variant="secondary" disabled>Desabilitado</button>
      <aside class="ui-form-panel ui-form-panel--rail">
        <header class="ui-form-panel-header">
          <h2 class="ui-form-panel-title">Formulário</h2>
          <p class="ui-form-panel-description">Descrição</p>
        </header>
        <div class="ui-form-panel-body">Campos</div>
        <footer class="ui-form-panel-footer">Ações</footer>
      </aside>
    </section>
  `,
})
class VisualPrimitivesFixture {}

describe('visual primitives fixture', () => {
  it.each(['light', 'dark'])('renders every primitive in %s theme', async (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    await TestBed.configureTestingModule({ imports: [VisualPrimitivesFixture] }).compileComponents();
    const fixture = TestBed.createComponent(VisualPrimitivesFixture);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    for (const selector of [
      '.ui-surface', '.ui-card', '.ui-alert', '.ui-menu', '.ui-menu-item',
      '.ui-tab[aria-selected="true"]', '.ui-table-row', '.ui-icon-button', '.p-button',
      '.ui-form-panel', '.ui-form-panel-header', '.ui-form-panel-body', '.ui-form-panel-footer',
    ]) {
      expect(root.querySelector(selector), selector).toBeTruthy();
    }
    expect(root.querySelectorAll('[class*="transition-all"]')).toHaveLength(0);
    expect(root.querySelector<HTMLButtonElement>('.p-button:disabled')?.disabled).toBe(true);
    document.documentElement.classList.remove('dark');
  });
});
