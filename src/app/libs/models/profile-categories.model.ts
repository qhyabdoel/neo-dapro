export class ProfileCategories {
	id: number;
	name: string;
	description: string;
	age: number;
    gender: string;
    occupation: string;
	created_at: string;
	updated_at: string;
	total_bot: number;

    clear() : void {
        this.id = 0;
        this.name = "";
        this.description = "";
		this.age;
		this.gender =  "male";
		this.occupation =  "";
        this.created_at = "";
        this.updated_at = "";
        this.total_bot = 0;
    }
}
