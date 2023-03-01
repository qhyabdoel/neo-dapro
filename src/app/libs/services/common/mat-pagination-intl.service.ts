import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class MatPaginationIntlService extends MatPaginatorIntl {
	translateService: TranslateService;
	override itemsPerPageLabel = 'Items per page';
	override nextPageLabel     = 'Next page';
	override previousPageLabel = 'Previous page';

	override getRangeLabel = (page: number, pageSize: number, length: number): string => {
		const of = this.translateService ? this.translateService.instant('I18N.MAT_PAGINATOR.OF') : 'of';
		if (length === 0 || pageSize === 0) {
			return '0 ' + of + ' ' + length;
		}
		length = Math.max(length, 0);
		const startIndex = page * pageSize > length ? (Math.ceil(length / pageSize) - 1) * pageSize : page * pageSize;

		const endIndex = Math.min(startIndex + pageSize, length);
		return startIndex + 1 + ' - ' + endIndex + ' ' + of + ' ' + length;
	}

	injectTranslateService(translate: TranslateService): void {
		this.translateService = translate;
		const currentLang = this.translateService.currentLang;
		this.translateService.onLangChange.subscribe(() => {
			this.translateLabels(currentLang);
		});

		this.translateLabels(currentLang);
	}

	translateLabels(currentLang?): void {
		this.firstPageLabel = this.translateService.instant('I18N.MAT_PAGINATOR.FIRST_PAGE');
		this.itemsPerPageLabel = this.translateService.instant('I18N.MAT_PAGINATOR.ITEMS_PER_PAGE');
		this.lastPageLabel = this.translateService.instant('I18N.MAT_PAGINATOR.LAST_PAGE');
		this.nextPageLabel = this.translateService.instant('I18N.MAT_PAGINATOR.NEXT_PAGE');
		this.previousPageLabel = this.translateService.instant('I18N.MAT_PAGINATOR.PREVIOUS_PAGE');
		this.changes.next(); // Fire a change event to make sure that the labels are refreshed
	}
}
