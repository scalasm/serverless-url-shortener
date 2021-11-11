import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthServiceService } from '../shared/auth-service.service';
import { Subscription } from 'rxjs';
import { CognitoUserInterface } from "@aws-amplify/ui-components";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  authEvent$!: Subscription;

  constructor(public authService: AuthServiceService) { }

  ngOnInit(): void {
    this.authEvent$ = this.authService.authenticationChangedEvent.subscribe({
      next: (isAuthenticated) => {
        console.log("User authenticated ? " + isAuthenticated);
      }
    });
  }

  ngOnDestroy(): void {
    this.authEvent$.unsubscribe();
  }
}
