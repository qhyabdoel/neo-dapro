import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PartialModule } from 'src/will-be-removed/partials/partial.module';
import { BrandComponent } from './brand/brand.component';
import { HeaderComponent } from './header/header.component';
import { MenuHorizontalComponent } from './menu-horizontal/menu-horizontal.component';
import { MenuVerticalComponent } from './menu-vertical/menu-vertical.component';
import { SubheaderComponent } from './subheader/subheader.component';
import { TopbarComponent } from './topbar/topbar.component';
import { PqsubtopbarComponent } from './pqheader/pqsubtopbar/pqsubtopbar.component';
import { UserProfileComponent } from './topbar/component/user-profile/user-profile.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { ContentCardListComponent } from './content/list/list.component';
import { MatCardModule } from '@angular/material/card';
import { HelpComponent } from './topbar/component/help/help.component';
import { LanguageSelectorComponent } from './topbar/component/language-selector/language-selector.component';
import { NotificationComponent } from './topbar/component/notification/notification.component';
import { SettingComponent } from './topbar/component/setting/setting.component';

@NgModule({
  declarations: [
    BrandComponent,
    HeaderComponent,
    MenuHorizontalComponent,
    MenuVerticalComponent,
    SubheaderComponent,
    TopbarComponent,
    PqsubtopbarComponent,
    UserProfileComponent,
    ContentCardListComponent,
    HelpComponent,
    LanguageSelectorComponent,
    NotificationComponent,
    SettingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    NgbProgressbarModule,
    NgbTooltipModule,
    PartialModule,
    RouterModule,
    TranslateModule.forChild(),
    MatTooltipModule,
    MatListModule,
    MatCardModule,
  ],
  providers: [],
  exports: [
    BrandComponent,
    HeaderComponent,
    MenuHorizontalComponent,
    MenuVerticalComponent,
    SubheaderComponent,
    TopbarComponent,
    PqsubtopbarComponent,
    UserProfileComponent,
    ContentCardListComponent,
    NotificationComponent,
    SettingComponent,
  ],
})
export class LayoutModule {}
