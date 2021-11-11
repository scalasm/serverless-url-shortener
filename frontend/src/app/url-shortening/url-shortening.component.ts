import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from "@angular/forms";
import { AuthServiceService } from "../shared/auth-service.service";
import { ShortenUrlResponse, UrlShorteningService } from "./url-shortening.service";
import * as MiscValidators from "../shared/misc.validator";


@Component({
  selector: "app-url-shortening",
  templateUrl: "./url-shortening.component.html",
  styleUrls: ["./url-shortening.component.css"]
})
export class UrlShorteningComponent implements OnInit {

  urlShorteningForm!: FormGroup;

  public shortUrl: string = "";

  constructor(
    private formBuilder: FormBuilder, 
    private urlShorteningService: UrlShorteningService, 
    public authService: AuthServiceService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.urlShorteningForm = this.formBuilder.group({
      "url": ["https://jasonwatmore.com/post/2019/11/21/angular-http-post-request-examples", 
        [Validators.required, MiscValidators.validHttpUrl]
      ],
      "ttl": [1, 
        [Validators.required, Validators.min(1), Validators.max(30)]
      ],
      "validate": ""
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.urlShorteningForm!.controls;
  }

  getErrorUrl(): string {
    var urlFormField = this.urlShorteningForm.get("url")!

    return urlFormField.hasError("required") ? "Field is required" :
      urlFormField.hasError("invalidHttpUrl") ? "Not a valid URL!" : "";
  }

  getErrorTtl(): string {
    var ttlFormField = this.urlShorteningForm.get("ttl")!

    if (ttlFormField.hasError("required")) {
      return "Field is required";
    } else if (ttlFormField!.hasError("min")) {
      return "Minimum value is 1 day";
    } else if (ttlFormField!.hasError("max")) {
      return "Maximum value is 30 days";
    }
    return "";
  }

  onSubmit(): void {
    if (this.urlShorteningForm!.invalid) {
      const validationErrors = this.getErrorUrl() + "\n" + this.getErrorTtl();
      console.log("There are validation errors for URL: " + validationErrors);
      return;
    }

    console.log(JSON.stringify(this.urlShorteningForm!.value, null, 2));

    this.doShortenUrl();
  }

  onClearClicked(): void {
    console.log("Clearing the form ...");
    this.f["url"].setValue("");
    this.f["ttl"].setValue("1");
  }

  doShortenUrl(): void {
    const url = this.f["url"].value;
    const ttl = this.f["ttl"].value;

    this.urlShorteningService.shortenUrl(url, ttl).subscribe({
      next: response => {
        console.log("Got a zipped URL: " + response.short_url);
        this.shortUrl = response.short_url;
      },
      error: error => {
        console.error('There was an error!', error);
      }
    });
  }
}
