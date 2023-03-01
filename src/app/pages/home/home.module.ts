import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from "@ngx-translate/core";

import { LayoutModule } from 'src/app/layouts/layout.module';
import { PartialModule } from 'src/will-be-removed/partials/partial.module';

import { HomeComponent } from './home.component';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    LayoutModule,
    PartialModule,
    RouterModule.forChild([
			{
				path: '',
				component: HomeComponent
			},
		]),
    TranslateModule.forChild(),
  ],
  providers: [],
  exports: [],
})
export class HomeModule {}
