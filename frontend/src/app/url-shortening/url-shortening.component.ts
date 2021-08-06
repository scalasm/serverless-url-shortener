import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from "@angular/forms";
import { AuthServiceService } from "../shared/auth-service.service";
import { ShortenUrlResponse, UrlShorteningService } from "./url-shortening.service";

@Component({
  selector: "app-url-shortening",
  templateUrl: "./url-shortening.component.html",
  styleUrls: ["./url-shortening.component.css"]
})
export class UrlShorteningComponent implements OnInit {

  formGroup!: FormGroup;

  public shortUrl: string = "";

  constructor(private formBuilder: FormBuilder, private urlShorteningService: UrlShorteningService, public authService: AuthServiceService) {
   }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    const urlRegex = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?";
    this.formGroup = this.formBuilder.group({
      "url": ["https://docs.aws.amazon.com/amplify/latest/userguide/multi-environments.html#standard", [Validators.required, Validators.pattern(urlRegex)]],
      "ttl": [1, [Validators.required, Validators.min(1), Validators.max(30)]],
      "validate": ""
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.formGroup!.controls;
  }

  getErrorUrl(): string {
    var urlFormField = this.formGroup!.get("url")!

    return urlFormField.hasError("required") ? "Field is required" :
      urlFormField!.hasError("pattern") ? "Not a valid URL!" : "";
  }

  getErrorTtl(): string {
    var ttlFormField = this.formGroup!.get("ttl")!

    return ttlFormField.hasError("required") ? "Field is required" :
      ttlFormField!.hasError("min") ? "Minimum value is 1 day" : 
      ttlFormField!.hasError("max") ? "Maximum value is 30 days" : "";
  }

  onSubmit(): void {
    if (this.formGroup!.invalid) {
      const validationErrors = this.getErrorUrl() + "\n" + this.getErrorTtl();
      console.log("There are validation errors for URL: " + validationErrors);
      return;
    }

    console.log(JSON.stringify(this.formGroup!.value, null, 2));

    this.doShortenUrl();
  }

  onClearClicked(): void {
    this.f["url"].setValue("");
  }

  doShortenUrl(): void {
    this.shortUrl = "https://www.supershort.com/123456"    

    const url = this.f["url"].value;
    const ttl = this.f["ttl"].value;

    this.urlShorteningService.shortenUrl(url, ttl).subscribe( (response) => {
      this.shortUrl = response.short_url;

      console.log("Got a zipped URL: " + this.shortUrl);
    });
  }
}
