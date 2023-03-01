// Angular
import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

/**
 * Returns string from Array
 */
@Pipe({
	name: "json2table",
	pure: false
})
export class Json2TablePipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}

	/**
	 * Transform
	 *
	 * @param json: any
	 * @param classes: any
	 */
	transform(json: any, classes?: any): any {
		return this.sanitizer.bypassSecurityTrustHtml(
			this.json2table(json, classes)
		);
	}

	json2table(json, classes) {
		if (json == null || json == "") return "No Data";
		// console.log(json,classes)
		var cols = Object.keys(json[0]);
		var headerRow = "";
		var bodyRows = "";
		classes =
			classes ||
			"table table-bordered table-striped table-hover dataTable js-exportable";
		cols.map(function(col) {
			headerRow +=
				"<th>" + col.charAt(0).toUpperCase() + col.slice(1) + "</th>";
		});
		json.map(function(row) {
			bodyRows += "<tr>";
			cols.map(function(colName) {
				bodyRows += "<td>" + row[colName] + "</td>";
			});
			bodyRows += "</tr>";
		});
		return (
			'<table class="table table-bordered table-striped table-hover dataTable js-exportable">\
            <thead><tr>' +
			headerRow +
			"</tr></thead>\
            <tfoot><tr>" +
			headerRow +
			"</tr></tfoot>\
            <tbody>" +
			bodyRows +
			"</tbody></table>"
		);
	}
}
