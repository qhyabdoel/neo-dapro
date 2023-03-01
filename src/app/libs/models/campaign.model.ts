export class Campaign {
	id: string;
	name: string;
	start_time: string;
	end_time: string;
	post_count: number;
	reply_count: number;
	is_active: boolean;
	immediate: boolean;
	created_at: string;
	updated_at: string;
	bots: any;
	hashtags: any;
	profile: string;

    clear() : void {
        this.id = "";
        this.name = "";
        this.start_time = "";
        this.end_time = "";
        this.post_count;
        this.reply_count;
        this.is_active = true;
		this.immediate = true;
        this.created_at = "";
        this.updated_at = "";
        this.bots = [];
        this.hashtags = [];
        this.profile = "";
    }
}
