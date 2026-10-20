import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LayoutService } from '../../../data/services/shared/layout';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-menuitem]',
  imports: [CommonModule, RouterModule, RippleModule],
  template: `
    <ng-container>
      @if (root && item.visible !== false) {
        <div class="layout-menuitem-root-text">
          {{ item.label }}
        </div>
      }
      @if ((!item.routerLink || item.items) && item.visible !== false) {
        <a
          [attr.href]="item.url"
          (click)="itemClick($event)"
          [ngClass]="item.styleClass"
          [attr.target]="item.target"
          tabindex="0"
          pRipple>
          <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
          <span class="layout-menuitem-text">{{ item.label }}</span>
          @if (item.items) {
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
          }
        </a>
      }
      @if (item.routerLink && !item.items && item.visible !== false) {
        <a
          (click)="itemClick($event)"
          [ngClass]="item.styleClass"
          [routerLink]="item.routerLink"
          routerLinkActive="active-route"
          [routerLinkActiveOptions]="
            item.routerLinkActiveOptions || {
              paths: 'exact',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored',
            }
          "
          [fragment]="item.fragment"
          [queryParamsHandling]="item.queryParamsHandling"
          [preserveFragment]="item.preserveFragment"
          [skipLocationChange]="item.skipLocationChange"
          [replaceUrl]="item.replaceUrl"
          [state]="item.state"
          [queryParams]="item.queryParams"
          [attr.target]="item.target"
          tabindex="0"
          pRipple>
          <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
          <span class="layout-menuitem-text">{{ item.label }}</span>
          @if (item.items) {
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
          }
        </a>
      }

      @if (item.items && item.visible !== false) {
        <ul class="layout-submenu" [ngClass]="submenuAnimation">
          @for (child of item.items; track child; let i = $index) {
            <li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child['badgeClass']"></li>
          }
        </ul>
      }
    </ng-container>
  `,
  styles: [
    `
      .layout-submenu {
        overflow: hidden;
        transition: max-height 400ms cubic-bezier(0.86, 0, 0.07, 1);
      }

      .layout-submenu.collapsed {
        max-height: 0;
      }

      .layout-submenu.expanded {
        max-height: 1000px;
      }
    `,
  ],
  providers: [LayoutService],
})
export class AppMenuitem implements OnInit, OnDestroy {
  public router = inject(Router);

  public route = inject(ActivatedRoute);

  private layoutService = inject(LayoutService);

  private changeDetectorRef = inject(ChangeDetectorRef);

  @Input() public item!: MenuItem;

  @Input() public index!: number;

  @Input() @HostBinding('class.layout-root-menuitem') public root!: boolean;

  @Input() public parentKey!: string;

  public active = false;

  public menuSourceSubscription: Subscription;

  public menuResetSubscription: Subscription;

  public key: string = '';

  constructor() {
    this.menuSourceSubscription = this.layoutService.menuSource$.subscribe(value => {
      Promise.resolve(null).then(() => {
        if (value.routeEvent) {
          this.setActive(value.key === this.key || value.key.startsWith(this.key + '-'));
        } else if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
          this.setActive(false);
        }
      });
    });

    this.menuResetSubscription = this.layoutService.resetSource$.subscribe(() => {
      this.setActive(false);
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateActiveStateFromRoute();
    });
  }

  public ngOnInit(): void {
    this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);

    this.active = this.hasActiveRoute(this.item);
  }

  public updateActiveStateFromRoute(): void {
    this.setActive(this.hasActiveRoute(this.item));
  }

  private hasActiveRoute(item: MenuItem): boolean {
    if (item.routerLink) {
      const url = Array.isArray(item.routerLink) ? item.routerLink[0] : item.routerLink;

      if (
        this.router.isActive(url, {
          paths: 'exact',
          queryParams: 'ignored',
          matrixParams: 'ignored',
          fragment: 'ignored',
        })
      ) {
        return true;
      }
    }

    return item.items?.some(child => this.hasActiveRoute(child)) ?? false;
  }

  private setActive(active: boolean): void {
    if (this.active === active) {
      return;
    }

    this.active = active;
    this.changeDetectorRef.markForCheck();
  }

  public itemClick(event: Event): void {
    // avoid processing disabled items
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    // execute command
    if (this.item.command) {
      this.item.command({ originalEvent: event, item: this.item });
    }

    // toggle active state
    if (this.item.items) {
      this.active = !this.active;
    }

    this.layoutService.onMenuStateChange({ key: this.key });
  }

  get submenuAnimation(): string {
    return this.root ? 'expanded' : this.active ? 'expanded' : 'collapsed';
  }

  @HostBinding('class.active-menuitem')
  get activeClass(): boolean {
    return this.active && !this.root;
  }

  public ngOnDestroy(): void {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }

    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }
}
