export class ManualConfigurations {
	id: string;
	setting_type: string;
	data: any;

    clear() : void {
        this.id="";
        this.setting_type="";
		this.data = {};
    }
}
