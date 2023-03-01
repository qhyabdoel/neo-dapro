export class Notification {
	id: string;
	col: string;
	op: string;
	val: number;
	chart_id: number;
	application_id: string;
	menu_id: string;
	notification_template_id: string;
	email_list: string;
	enable: boolean;
	chart: object;
	menu: object;
	notification_template: object;
	criterias: any;
	condition: string;

    clear() : void {
        this.id = "";
		this.col = "";
		this.op = "";
		this.val = 0;
		this.chart_id = 0;
		this.application_id = "";
		this.menu_id = "00000000-0000-0000-0000-000000000000";
		this.notification_template_id = "00000000-0000-0000-0000-000000000000";
		this.email_list = "";
		this.enable = false;
		this.chart = {};
		this.menu = {};
		this.notification_template = {};
		this.criterias = [];
    }
}
