import { Pipe, PipeTransform } from "@angular/core";
import * as _moment from "moment";

@Pipe({
	name: "keyvals",
})
export class KeyValsPipe implements PipeTransform {
	transform(value: any): any {
		let arr = [];
		if (value != undefined && value != null) {
			value.map((s) => {
				arr.push({
					key: s[0],
					value: s[0],
				});
			});
		}
		return arr;
	}
}
