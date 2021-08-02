import { Component } from '@angular/core';

import {AuthState, onAuthUIStateChange} from "@aws-amplify/ui-components";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'Zoorl Serverless URL Shortener';
}
