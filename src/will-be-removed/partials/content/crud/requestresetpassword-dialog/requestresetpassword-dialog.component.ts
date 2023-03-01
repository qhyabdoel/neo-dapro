import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from "@angular/forms";

@Component({
  selector: 'pq-requestresetpassword-dialog',
  templateUrl: './requestresetpassword-dialog.component.html'
})
export class RequestResetPasswordDialogComponent implements OnInit {

  viewLoading = false;
  changePasswordForm: FormGroup;
  
  msg: string;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RequestResetPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


  ngOnInit() {
    this.changePasswordForm = this.fb.group({
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(100), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ]
    });
  }

  onNoClick(): void {
		this.dialogRef.close();
  }
  
  onYesClick() {
    /* Server loading imitation. Remove this */
    console.log("onYesClick");
    this.viewLoading = true;
    let controls = this.changePasswordForm.controls;
    if(!(this.checkPassword(controls)) ) {
      this.viewLoading = false;
      return;
    }

    this.data = {
      email : controls.email.value
    };

    setTimeout(() => {
      this.dialogRef.close(this.data);
    }, 1000);
  }

  getErrorText(value){
    let text = '';
    if(!value) return text;

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
        text = 'empty mail';
        break;
    }
    return text
  }
  
  checkPassword(controls) {
    let email = controls.email.value;
   
		if (email == "" ) {
      return false;
    }
    
    return true;
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
