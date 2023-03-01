import { Pipe, PipeTransform } from '@angular/core';
import shortHash from 'short-hash';

@Pipe({
	name: 'shortHash'
})
export class ShortHashPipe implements PipeTransform {
	transform(value: any): any {
		return shortHash(value);
	}
}
