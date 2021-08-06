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

  user: CognitoUserInterface | undefined;

  constructor(public authService: AuthServiceService) { }

  ngOnInit(): void {
    this.authEvent$ = this.authService.authenticationChangedEvent.subscribe({
      next: (isAuthenticated) => {
        console.log( "User authenticated ? " + isAuthenticated );
        this.user = this.authService.user;
        if (this.user) {
          console.log(JSON.stringify(this.user));
          console.log(this.authService.authToken);
        }        
      }
    });
  }

  ngOnDestroy(): void {
    this.authEvent$.unsubscribe();
  }
}
