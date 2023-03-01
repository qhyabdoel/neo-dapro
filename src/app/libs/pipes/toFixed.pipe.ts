import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixed'
})
export class ToFixedPipe implements PipeTransform {
  transform(value: number): string {
    // console.log(value, Object.keys(value));
    return value.toFixed();
   }
}
