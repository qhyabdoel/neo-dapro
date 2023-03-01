// Angular
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns string from Array
 */
@Pipe({
	name: 'replace'
})
export class ReplacePipe implements PipeTransform {
	/**
	 * Transform
	 *
	 * @param string: any
	 * @param args: any
	 */
	transform(string: any, opts?: any): any {
		return string.replace(`/(${opts})\w+/g`,"");
	}
}
