export class Bots {
	id: number;
	nickname: string;
	email: string;
	description: string;
	gender: string;
	age: string;
	profile_ids: string;
	created_at: string;
	updated_at: string;
	status: string;
	total_campaign: number;
	campaigns: object;
	total_bot: number;

    clear() : void {
        this.id = 0;
        this.nickname = "";
        this.email = "";
        this.gender = "";
        this.age = "";
        this.profile_ids = "";
        this.created_at = null;
        this.updated_at = null;
		this.status =  "";
		this.total_campaign=0;
		this.total_bot=0;
		this.campaigns =  [];
    }
}
