import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RouterState, StoreRouterConnectingModule } from '@ngrx/router-store';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ImgFallbackModule } from 'ngx-img-fallback';
import { MatPaginationIntlService } from 'src/app/libs/services';
import { PartialModule } from 'src/will-be-removed/partials/partial.module';
import { AppRoutingModule } from './app-routing.module';
import { AuthenticationEffects } from 'src/app/libs/store/effects/authentication.effects';
import { DataProcessingEffects } from 'src/app/libs/store/effects/pds/dataprocesssing.effects';
import {
  ApplicationService,
  AuthenticationService,
  AuthService,
  HeaderConfigService,
  HtmlClassService,
  InterceptService,
  LayoutConfigService,
  LayoutRefService,
  LayoutUtilsService,
  MenuConfigService,
  MenuHorizontalService,
  PageConfigService,
  QueryCommandService,
  SplashScreenService,
  WorkspaceService,
} from './libs/services';

import { LayoutConfig } from './libs/configs';
import { metaReducers, reducers } from './libs/store/reducers';
import { AppComponent } from './app.component';
import { RouteGuard } from './libs/guards/route.guard';
import { AdminGuard } from './libs/guards/admin.guard';

export function initializeLayoutConfig(appConfig: LayoutConfigService) {
  // initialize app by loading default demo layout config
  return () => {
    if (appConfig.getConfig() === null) {
      appConfig.loadConfigs(new LayoutConfig().configs);
    }
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    EffectsModule.forFeature([AuthenticationEffects, DataProcessingEffects]),
    HttpClientModule,
    ImgFallbackModule,
    NgxPermissionsModule.forRoot(),
    PartialModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    // StoreRouterConnectingModule.forRoot({ routerState: RouterState.Minimal }),
    TranslateModule.forRoot(),
    EffectsModule.forRoot([]),
  ],
  providers: [
    // GUARD
    RouteGuard,
    AdminGuard,
    // GUARD
    AuthService,
    ApplicationService,
    AuthenticationService,
    HeaderConfigService,
    HtmlClassService,
    LayoutConfigService,
    LayoutRefService,
    LayoutUtilsService,
    MenuConfigService,
    MenuHorizontalService,
    PageConfigService,
    QueryCommandService,
    SplashScreenService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true,
    },
    {
      provide: MatPaginatorIntl,
      deps: [TranslateService],
      // useClass: MatPaginationIntlService,
      useFactory: (translate: TranslateService) => {
        const service = new MatPaginationIntlService();
        service.injectTranslateService(translate);
        return service;
      },
    },
    {
      // layout config initializer
      provide: APP_INITIALIZER,
      useFactory: initializeLayoutConfig,
      deps: [LayoutConfigService],
      multi: true,
    },
    WorkspaceService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
