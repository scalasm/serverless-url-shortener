import { Injectable } from '@angular/core';

import { AuthState, CognitoUserInterface } from "@aws-amplify/ui-components";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  public _authenticationChangedSubject = new BehaviorSubject<boolean>(false);
  public authenticationChangedEvent = this._authenticationChangedSubject.asObservable();

  user: CognitoUserInterface | undefined;
  authState: AuthState | undefined;

  constructor() { }

  public onUserAuthenticated(user: CognitoUserInterface | undefined, authState: AuthState | undefined): void {
    console.log(`Authenticating user == ${user} and authState == ${authState}`)
    this.authState = authState;
    this.user = user;

    this._authenticationChangedSubject.next(this.isLoggedIn);
  }

  public get authToken(): string {
    return this.user?.signInUserSession?.idToken?.jwtToken;
  }

  public get isLoggedIn(): boolean {
    return this.authState === 'signedin' && this.user != undefined;
  }

  public get userEmail(): string {
    if (this.user && this.user.attributes && this.user.attributes["email"]) {
      return this.user.attributes["email"];
    }
    return "";
  }
}
