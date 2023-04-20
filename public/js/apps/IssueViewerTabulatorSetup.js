/**
 * Copyright (C) 2023 fhcomplete.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 *
 */
export const IssueViewerTabulatorOptions = {
	height: 700,
	layout: 'fitColumns',
	columns: [
		{title: 'Issue ID', field: 'IssueId', headerFilter: true},
		{title: 'Statuscode', field: 'Statuscode', headerFilter: true}
	],
	rowFormatter: function(row) {
		let data = row.getData(); // get data for this row

		console.log(data);

		// If data is not null and provides the property RequestId and it is not null
		//~ if (data != null && data.hasOwnProperty('RequestId') && data.RequestId != null)
		//~ {
			//~ let requestId = data.RequestId;

			//~ if (requestId.includes("error"))
			//~ {
				//~ row.getElement().style.color = "red";
			//~ }
			//~ else if (requestId.includes("warning"))
			//~ {
				//~ row.getElement().style.color = "orange";

			//~ }
		//~ }
	}
};

/**
 *
 */
export const IssueViewerTabulatorEventHandlers = [
	{
		event: "rowClick",
		handler: function(e, row) {
			alert(row.getData().Data);
		}
	}
];


