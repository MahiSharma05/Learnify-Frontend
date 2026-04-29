import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="layout">
      <app-navbar></app-navbar>
      <div class="layout__body">
        <app-sidebar></app-sidebar>
        <main class="layout__content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg); }
    .layout__body { display: flex; flex: 1; overflow: hidden; }
    .layout__content { flex: 1; overflow-y: auto; padding: 28px 32px; }
    @media (max-width: 768px) { .layout__content { padding: 16px; } }
  `]
})
export class MainLayoutComponent {}
