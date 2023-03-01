// Angular
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Sanitize HTML
 */
@Pipe({
	name: 'numberFormat'
})
export class NumberFormatPiPe implements PipeTransform {
	/**
	 * Transform
	 *
	 * @param number: any ex. '123456'
	 * @param decimals: any ex. '2'
	 * @param dec_point : any ex. ','
	 * @param thousands_sep : any ex. '.'
	 */
	transform(number:any, decimals?:any, dec_point?:any, thousands_sep?:any): any {
		number = (number + '').replace(',', '').replace(' ', '');
		var n = !isFinite(+number) ? 0 : +number,
			prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
			sep = (typeof thousands_sep === 'undefined') ? '.' : thousands_sep,
			dec = (typeof dec_point === 'undefined') ? ',' : dec_point,
			s,
			toFixedFix = function(n, prec) {
			var k = Math.pow(10, prec);
			return '' + Math.round(n * k) / k;
			};
		// Fix for IE parseFloat(0.55).toFixed(0) = 0;
		s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
		if (s[0].length > 3) {
			s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		}
		if ((s[1] || '').length < prec) {
			s[1] = s[1] || '';
			s[1] += new Array(prec - s[1].length + 1).join('0');
		}
		return s.join(dec);
	}

}
