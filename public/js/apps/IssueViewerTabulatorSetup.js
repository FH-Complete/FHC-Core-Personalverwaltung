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
		{title: 'Datum', field: 'Datum', headerFilter: true, formatter:
			function(cell){
				return cell.getValue().replace(/(.*)-(.*)-(.*)\s(.*)/, '$3.$2.$1 $4');
			}
		},
		{title: 'Fehlercode', field: 'Fehlercode', headerFilter: true},
		{title: 'Inhalt', field: 'Inhalt', headerFilter: true},
		{title: 'Vorname', field: 'Vorname', headerFilter: true},
		{title: 'Nachname', field: 'Nachname', headerFilter: true},
		{title: 'Person Id', field: 'PersonId', headerFilter: true},
		{title: 'Statuscode', field: 'Statuscode', headerFilter: true},
		{title: 'Bearbeitet von', field: 'Bearbeitet von', headerFilter: true},
		{title: 'Bearbeitet am', field: 'Bearbeitet am', headerFilter: true},
		{title: 'Issue Id', field: 'IssueId', headerFilter: true},
		{title: 'Fehlertyp', field: 'Fehlertyp', headerFilter: true}
	],
	rowFormatter: function(row) {
		let data = row.getData(); // get data for this row

		// If data is not null and provides the property Fehlertyp and it is not null
		if (data != null && data.hasOwnProperty('Fehlertyp') && data.Fehlertyp != null)
		{
			let fehlertyp = data.Fehlertyp;

			// color errors and warnings
			if (fehlertyp == "error")
			{
				row.getElement().style.color = "red";
			}
			else if (fehlertyp == "warning")
			{
				row.getElement().style.color = "orange";
			}
		}
	}
};

/**
 *
 */
export const IssueViewerTabulatorEventHandlers = [
	{
		// show issue text on row click
		event: "rowClick",
		handler: function(e, row) {
			alert(row.getData().Inhalt);
		}
	}
];


