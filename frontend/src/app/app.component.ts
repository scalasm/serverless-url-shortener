import { ChangeDetectorRef, Component } from '@angular/core';

import { AuthState, onAuthUIStateChange, CognitoUserInterface } from "@aws-amplify/ui-components";
import { AuthServiceService } from './shared/auth-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  user: CognitoUserInterface | undefined;
  authState: AuthState | undefined;

  constructor(private ref: ChangeDetectorRef, private authService: AuthServiceService) { }

  ngOnInit() {
    onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.user = authData as CognitoUserInterface;
      this.ref.detectChanges();

      this.authService.onUserAuthenticated(this.user, this.authState);
    })
  }

  ngOnDestroy(): void {
    onAuthUIStateChange
  }
}
