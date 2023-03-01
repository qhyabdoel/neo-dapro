import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ApiService } from "src/app/libs/services";

@Component({
  selector: 'pq-requestnewpassword',
  templateUrl: './requestnewpassword.component.html',
})
export class RequestnewpasswordComponent implements OnInit {
  isPasswordComfirmPasswordNotMatch: boolean = false;
  changePasswordForm: FormGroup;
  loadUrl: string;
  params: any;
  constructor(private _apicall: ApiService, private activatedRoute: ActivatedRoute, private fb: FormBuilder, private route: Router,) {
    this.loadUrl = this.route.url;
    let split = this.loadUrl.split("?");
    console.log(split);
    this.activatedRoute.queryParams.subscribe((params: any) => {
      console.log(params);
      this.params = params;
    });
  }

  ngOnInit() {
    this.changePasswordForm = this.fb.group({
      newPassword: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^(?=.*?[a-z])(.{13,}|(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,12})$/), //(/^(?=.*[a-zA-Z0-9])[a-zA-Z0-9]+$/), //(/^[A-Za-z0-9_@.#$=!%^)(\]:\*;\?\/\,}{'\|<>\[&\+-]*$/), //(/^[a-zA-Z0-9!@#$%^&*()]+$/), // /^(?=.{10,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()])
          Validators.minLength(3),
          Validators.maxLength(12),
        ]),
      ],
      comfirmPassword: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(12),
        ]),
      ],
    });
  }

  async onYesClick() {
    /* Server loading imitation. Remove this */
    console.log("onYesClick");
    let controls = this.changePasswordForm.controls;
    if (!(this.checkPassword(controls)) || this.isPasswordComfirmPasswordNotMatch == true) {
      return;
    }

    let param = {
      "email": this.params.email, //"febrianan.ugrah92@gmail.com",
      "password": controls.newPassword.value, //"IniPassword123!@",
      "password_confirmation": controls.comfirmPassword.value,//"IniPassword123!@",
      "password_token": this.params.password_token //"yN5_R6-129TFU0sfYEDiJ5CBWUTmmz5Cv3bUvRe1CKkhiFn10n5FyGT2BdV2i5y7gflLJslvIkUcsnYLcEkHDw%3D%3D"
    };
    let url = "api/password/change"
    let results = await this._apicall.postApi(url, param, true);

    let isApp = localStorage.getItem('isApp');
    if (isApp && isApp == 'ya') this.route.navigate(["auth/application_login"]);
    else this.route.navigate(["auth/login"]);
  }

  onNoClick() {
    let isApp = localStorage.getItem('isApp');
    if (isApp && isApp == 'ya') this.route.navigate(["auth/application_login"]);
    else this.route.navigate(["auth/login"]);
  }

  getErrorText(value) {
    let text = '';
    if (!value) return text;

    let key = Object.keys(value);
    switch (key[0]) {
      case 'required':
        text = 'Required';
        break;
      case 'minlength':
        text = 'Minimum 3 characters';
        break;
      case 'maxlength':
        text = 'Up to 12 characters';
        break;
      case 'pattern':
        text = 'Must consist of uppercase, lowercase and special characters';
        break;
      default:
        text = '';
        break;
    }
    return text
  }

  checkPassword(controls) {
    this.isPasswordComfirmPasswordNotMatch = false;
    let newPassword = controls.newPassword.value;
    let newPasswordConfirmation = controls.comfirmPassword.value;

    if (newPassword !== "" && newPasswordConfirmation !== "" && (newPassword !== newPasswordConfirmation)) {
      this.isPasswordComfirmPasswordNotMatch = true;
      return false
    }

    return true;
  }

}
