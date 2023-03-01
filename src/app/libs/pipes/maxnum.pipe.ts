import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "maxnum",
})
export class MaxNumPipe implements PipeTransform {
	transform(value: any, args?: any): any {
        return Number(value)>Number(args) ? Number(args) : Number(value)
    };
}
