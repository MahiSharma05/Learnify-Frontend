import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  template: `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;">
      <p>Signing you in...</p>
    </div>
  `
})
export class OAuth2CallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        this.auth.handleOAuthCallback(token);
      } else {
        this.auth.logout();
      }
    });
  }
}