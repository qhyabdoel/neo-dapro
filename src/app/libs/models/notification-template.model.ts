export class NotificationTemplate {
	id: string;
	template_name: string;
	notification_description: string;
	email_subject: string;
	email_body: string;
	notification_count: number;

    clear() : void {
        this.id="";
        this.template_name="";
		this.notification_description = "";
		this.email_subject = "";
		this.email_body = "";
		this.notification_count = 0;
    }
}
