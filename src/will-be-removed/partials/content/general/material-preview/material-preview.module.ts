import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from 'ngx-clipboard';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MaterialPreviewComponent } from './material-preview.component';
import { PortletModule } from '../portlet/portlet.module';
import { HighlightModule } from 'ngx-highlightjs';
import { LibModule } from "src/app/libs/lib.module";

@NgModule({
	imports: [
		CommonModule,
		HighlightModule,
		PerfectScrollbarModule,
		PortletModule,
		ClipboardModule,
    LibModule,

		MatTabsModule,
		MatExpansionModule,
		MatCardModule,
		MatIconModule,
	],
	exports: [MaterialPreviewComponent],
	declarations: [MaterialPreviewComponent]
})
export class MaterialPreviewModule {
}
