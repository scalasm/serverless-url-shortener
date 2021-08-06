import { Injectable } from '@angular/core';

import { AuthState, CognitoUserInterface } from "@aws-amplify/ui-components";
import { HttpClientModule } from '@angular/common/http';
import { Subject, Observable, throwError  } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthServiceService as AuthService } from '../shared/auth-service.service';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';

class ShortenUrlRequest {
    constructor(public url: string, public ttl: number) { }
}

export class ShortenUrlResponse {
    constructor(public url: string, public short_url: string) { }
}

@Injectable({
    providedIn: 'root'
})
export class UrlShorteningService {
    public shortenUrlResponse$ = new Subject<ShortenUrlResponse>();

    constructor(private http: HttpClient, private authService: AuthService) { }

    public shortenUrl(url: string, ttl: number) : Observable<ShortenUrlResponse> {
        const request = new ShortenUrlRequest(url, ttl);

        const headers = { "Authorization": `Bearer ${this.authService.authToken}`, 
        "Access-Control-Allow-Origin": "*" };
  
        return this.http.post<ShortenUrlResponse>(environment.awsconfig.apiEndpoint, request, {
            headers: headers
        });
    }
}
