import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginator'
})
export class PaginatorPipe implements PipeTransform {

  transform(data: any[], constanta: any, index?: any): any[] {
    // return empty array if array is falsy
    if (!data || !constanta) { return data; }

    // return the original array if search text is empty
    if (!constanta) { return data; }
    var to = ( parseInt(index) * parseInt(constanta) ) -1;
    var from = ( parseInt(index) * parseInt(constanta) ) -  parseInt(constanta);

    // retrun the filtered array
    var arr=[];
    return data.map( (item, idx) => {
      if (idx >= Number(to) && idx>=Number(from)) {
        arr.push(item[index]);
      }
      return arr;
    });
   }
}
