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

import {CoreFilterCmpt} from "../../../../../js/components/filter/Filter.js";
import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';

export default {
	name: 'PV21IssueViewer',
	data: function() {
		return {
			issueViewerTabulatorOptions: {
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
					{title: 'Verarbeitet von', field: 'Verarbeitet von', headerFilter: true},
					{title: 'Verarbeitet am', field: 'Verarbeitet am', headerFilter: true},
					{title: 'Issue Id', field: 'IssueId', headerFilter: true},
					{title: 'Fehlertyp', field: 'Fehlertyp', headerFilter: true}
				],
				rowFormatter: function(row) {
					let data = row.getData(); // get data for this row

					// If data is not null and provides the property Fehlertyp and it is not null
					if (data != null && data.hasOwnProperty('Fehlertyp') && data.Fehlertyp != null)
					{
						let fehlertyp = data.Fehlertyp;
						let statuscode = data.Statuscode;

						// color errors and warnings
						if (statuscode == "resolved")
						{
							row.getElement().style.color = "green";
						}
						else if (fehlertyp == "error")
						{
							row.getElement().style.color = "red";
						}
						else if (fehlertyp == "warning")
						{
							row.getElement().style.color = "orange";
						}
					}
				}
			},
			issueViewerTabulatorEventHandlers: [
				{
					// show issue text on row click
					event: "rowClick",
					handler: function(e, row) {
						alert(row.getData().Inhalt);
					}
				}
			]
		};
	},
	components: {
		CoreNavigationCmpt,
		CoreFilterCmpt
	},
	methods: {
		newSideMenuEntryHandler: function(payload) {
			this.appSideMenuEntries = payload;
		}
	},
	template: /* html */`
		<!-- Navigation component -->
		<core-navigation-cmpt></core-navigation-cmpt>

		<div id="content">
			<div>
				<!-- Filter component -->
				<core-filter-cmpt
					title="Personal Fehlermonitoring"
					filter-type="IssueViewer"
					:tabulator-options="issueViewerTabulatorOptions"
					:tabulator-events="issueViewerTabulatorEventHandlers"
					@nw-new-entry="newSideMenuEntryHandler"
					>
				</core-filter-cmpt>
			</div>
		</div>
	`
};
