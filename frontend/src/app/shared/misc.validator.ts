import { FormControl } from "@angular/forms";

  export function validHttpUrl(control: FormControl) : {[s: string]: boolean} | null {
//    const urlCheckerRegex = new RegExp("(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?");
    const regex = /https?:\/\/[\\da-z.-]+\.[a-z.]{2,6}[\/\\w #.-]*\/?/gm;
    if (!regex.test(control.value)) {
      return {"invalidHttpUrl": true}
    }
    return null;
  }