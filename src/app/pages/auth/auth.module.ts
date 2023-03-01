import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NgbModule, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { ApplicationService, InterceptService } from 'src/app/libs/services';

import { AuthComponent } from './auth.component';

import { AuthService } from 'src/app/libs/services';
import { AuthenticationEffects } from 'src/app/libs/store/effects/authentication.effects';
import { authenticationReducer } from 'src/app/libs/store/reducers/authentication.reducer';
import { AuthGuard } from 'src/app/libs/guards/auth.guard';
import { RouteGuard } from 'src/app/libs/guards/route.guard';

import { PartialModule } from 'src/will-be-removed/partials/partial.module';
import { MaterialPreviewModule } from 'src/will-be-removed/partials/content/general/material-preview/material-preview.module';
import { ModalComponent } from 'src/app/components/modals/modal/modal.component';
import {
  ChangepasswordDialogComponent,
  Modal2Component,
  RequestResetPasswordDialogComponent,
} from 'src/will-be-removed/partials/content';
import { AuthenticationComponent } from './authentication-component/authentication.component';
import { AuthNoticeComponent } from './auth-notice/auth-notice.component';
import { RequestnewpasswordComponent } from './requestnewpassword/requestnewpassword.component';
import { ComponentModule } from 'src/app/components/component.module';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: AuthenticationComponent, data: { returnUrl: window.location.href } },
      { path: 'application_login', component: AuthenticationComponent },
      { path: 'requestnewpassword', component: RequestnewpasswordComponent, canActivate: [RouteGuard] },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule.forChild(routes),
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    TranslateModule.forChild(),
    StoreModule.forFeature('authentication', authenticationReducer),
    EffectsModule.forFeature([AuthenticationEffects]),
    PartialModule,
    MaterialPreviewModule,
    ComponentModule,
    MatSnackBarModule,
  ],
  providers: [
    InterceptService,
    NgbAlertConfig,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true,
    },
    CookieService,
  ],
  exports: [AuthComponent],
  declarations: [AuthComponent, AuthNoticeComponent, AuthenticationComponent, RequestnewpasswordComponent],
  entryComponents: [
    ModalComponent,
    Modal2Component,
    ChangepasswordDialogComponent,
    RequestResetPasswordDialogComponent,
  ],
})
export class AuthModule {
  static forRoot(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [AuthService, AuthGuard, ApplicationService, CookieService],
    };
  }
}
