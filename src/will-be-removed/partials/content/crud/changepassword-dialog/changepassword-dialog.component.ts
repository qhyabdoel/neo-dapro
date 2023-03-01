import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';

@Component({
  selector: 'pq-changepassword-dialog',
  templateUrl: './changepassword-dialog.component.html',
})
export class ChangepasswordDialogComponent implements OnInit {
  viewLoading = false;
  isPasswordMatchWithOld: boolean = false;
  isPasswordComfirmPasswordNotMatch: boolean = false;
  changePasswordForm: FormGroup;
  fieldPassword: boolean;
  fieldPasswordNew: boolean;
  fieldPasswordConfirm: boolean;

  msg: string;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ChangepasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.changePasswordForm = this.fb.group({
      oldPassword: [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(12), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
      newPassword: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]$/), //(/^[A-Za-z0-9_@.#$=!%^)(\]:\*;\?\/\,}{'\|<>\[&\+-]*$/), //(/^[a-zA-Z0-9!@#$%^&*()]+$/), // /^(?=.{10,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()])
          Validators.minLength(3),
          Validators.maxLength(12),
        ]),
      ],
      comfirmPassword: [
        '',
        Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(12)]),
      ],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick() {
    /* Server loading imitation. Remove this */
    console.log('onYesClick');
    this.viewLoading = true;
    let controls = this.changePasswordForm.controls;
    if (
      !this.checkPassword(controls) ||
      this.isPasswordComfirmPasswordNotMatch == true ||
      this.isPasswordMatchWithOld == true
    ) {
      this.viewLoading = false;
      return;
    }

    this.data = {
      oldPassword: controls.oldPassword.value,
      newPassword: controls.newPassword.value,
      comfirmPassword: controls.comfirmPassword.value,
    };

    setTimeout(() => {
      this.dialogRef.close(this.data);
    }, 1000);
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
    return text;
  }

  checkPassword(controls) {
    this.isPasswordMatchWithOld = false;
    this.isPasswordComfirmPasswordNotMatch = false;
    let oldPassword = controls.oldPassword.value;
    let newPassword = controls.newPassword.value;
    let newPasswordConfirmation = controls.comfirmPassword.value;
    if (oldPassword !== '' && newPassword !== '' && oldPassword === newPassword) {
      this.isPasswordMatchWithOld = true;
      return false;
    }
    if (newPassword !== '' && newPasswordConfirmation !== '' && newPassword !== newPasswordConfirmation) {
      this.isPasswordComfirmPasswordNotMatch = true;
      return false;
    }

    return true;
  }

  togglePassword() {
    this.fieldPassword = !this.fieldPassword;
  }

  togglePasswordNew() {
    this.fieldPasswordNew = !this.fieldPasswordNew;
  }

  togglePasswordConfirm() {
    this.fieldPasswordConfirm = !this.fieldPasswordConfirm;
  }

  // @HostListener('document:click', ['$event', '$event.target'])
  // onClick(event: MouseEvent, targetElement: HTMLElement): void {
  //     console.log(targetElement.classList);
  //     if (!targetElement) {
  //       return;
  //     };
  //     const cls = targetElement.classList;
  //     if (cls[0] == "cdk-overlay-backdrop" || cls[0] == "kt-portlet__head") {
  //       this.onNoClick();
  //     };

  //   }
}
