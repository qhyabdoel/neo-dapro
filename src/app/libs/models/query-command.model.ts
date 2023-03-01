export class QueryCommand {
  public idNum: number;
  public name: string;
  public alias: string;
  public title: string;
  public description: string;
  public image: string;
  public text: string;
  public buttonClass: string;
  public label: string;
  public in: boolean;
  public out: boolean;
  public branch: boolean;
  public multiIn: boolean;
  public multiOut: boolean;
  public properties: any;
  public isNotifyOnQuerySuccess: boolean;
  public actionToDispatchOnQuerySuccess: any;
}
