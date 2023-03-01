import { Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'typeCheck'
})
export class TypeCheckPipe implements PipeTransform {
	constructor() {}

	transform(value: any, type: 'number' | 'string' | 'object'): boolean {
		return typeof value === type;
	}
}
