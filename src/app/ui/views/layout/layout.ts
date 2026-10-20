import { Component, inject, Renderer2, ViewChild, type OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LayoutService } from '../../../data/services/shared/layout';
import { AppTopbar } from '../../components/layout/topbar';
import { AppSidebar } from '../../components/layout/sidebar';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    AppTopbar,
    AppSidebar,
    RouterModule,
  ],
  template: `<div class="layout-wrapper" [ngClass]="containerClass">
    <app-topbar />
    <app-sidebar />
    <div class="layout-main-container">
      <div class="layout-main">
        <router-outlet />
      </div>
    </div>
    <div class="layout-mask animate-fadein"></div>
  </div> `,
})
export class AppLayoutComponent implements OnDestroy {
  public layoutService = inject(LayoutService);

  public renderer = inject(Renderer2);

  public router = inject(Router);

  public authenticationRepository = inject(AuthenticationRepository);

  public overlayMenuOpenSubscription: Subscription;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public menuOutsideClickListener!: any;

  @ViewChild(AppSidebar) public appSidebar!: AppSidebar;

  @ViewChild(AppTopbar) public appTopBar!: AppTopbar;

  constructor() {
    this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.renderer.listen('document', 'click', event => {
          if (this.isOutsideClicked(event)) {
            this.hideMenu();
          }
        });
      }

      if (this.layoutService.layoutState().staticMenuMobileActive) {
        this.blockBodyScroll();
      }
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.hideMenu();
    });
  }

  public isOutsideClicked(event: MouseEvent): boolean {
    if (typeof document === 'undefined') return false;
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');
    const eventTarget = event.target as Node;

    return !(
      sidebarEl?.isSameNode(eventTarget) ||
      sidebarEl?.contains(eventTarget) ||
      topbarEl?.isSameNode(eventTarget) ||
      topbarEl?.contains(eventTarget)
    );
  }

  public hideMenu(): void {
    this.layoutService.layoutState.update(prev => ({
      ...prev,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false,
    }));
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  public blockBodyScroll(): void {
    if (typeof document === 'undefined') return;
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    } else {
      document.body.className += ' blocked-scroll';
    }
  }

  public unblockBodyScroll(): void {
    if (typeof document === 'undefined') return;
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'),
        ' '
      );
    }
  }

  get containerClass(): object {
    return {
      'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
      'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
      'layout-static-inactive':
        this.layoutService.layoutState().staticMenuDesktopInactive &&
        this.layoutService.layoutConfig().menuMode === 'static',
      'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive,
    };
  }

  public ngOnDestroy(): void {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }
}
