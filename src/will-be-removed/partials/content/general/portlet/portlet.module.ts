import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortletComponent } from './portlet.component';
import { PortletHeaderComponent } from './portlet-header.component';
import { PortletBodyComponent } from './portlet-body.component';
import { PortletFooterComponent } from './portlet-footer.component';

@NgModule({
	imports: [
		CommonModule,
		MatProgressSpinnerModule,
		MatProgressBarModule
	],
	declarations: [
		PortletComponent,
		PortletHeaderComponent,
		PortletBodyComponent,
		PortletFooterComponent,
	],
	exports: [
		PortletComponent,
		PortletHeaderComponent,
		PortletBodyComponent,
		PortletFooterComponent,
	]
})
export class PortletModule { }
