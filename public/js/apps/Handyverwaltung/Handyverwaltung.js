/**
 * Copyright (C) 2022 fhcomplete.org
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

//import {LogsViewerTabulatorOptions} from './TabulatorSetup.js';
//import {LogsViewerTabulatorEventHandlers} from './TabulatorSetup.js';
import fhcapifactory from "../../../../../js/apps/api/fhcapifactory.js";
import pv21apifactory from "../../api/vbform/api.js";

import {CoreFilterCmpt} from '../../../../../js/components/filter/Filter.js';
import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';

import CoreVerticalsplitCmpt from '../../../../../js/components/verticalsplit/verticalsplit.js';
import {EmailTelData} from '../../components/employee/contact/EmailTelData.js';
import Betriebsmittel from "../../../../../js/components/Betriebsmittel/Betriebsmittel.js";

import Phrasen from '../../../../../js/plugin/Phrasen.js';

Vue.$fhcapi = {...fhcapifactory, ...pv21apifactory};

const handyVerwaltungApp = Vue.createApp({
	data: function() {
		return {
                    personid: -1,
                    personuid: 'keine'
		};
	},
	components: {
		CoreNavigationCmpt,
		CoreFilterCmpt,
                CoreVerticalsplitCmpt,
                EmailTelData,
                Betriebsmittel
	},
	methods: {
	},
        template: `
		<!-- Navigation component -->
		<core-navigation-cmpt></core-navigation-cmpt>

		<div id="content">
			<core-verticalsplit-cmpt>
                            <template #top>
                                <p><label for="personid">personid</label><input id="personid" v-model="personid"></p>
                                <p><label for="personuid">personuid</label><input id="personuid" v-model="personuid"></p>
                            </template>
    
                            <template #bottom>
                                <div class="row pt-md-4">      
                                     <div class="col">
                                         <div class="card">
                                            <div class="card-header">
                                                <div class="h5 mb-0"><h5>{{ $p.t('global', 'kontakt') }}</h5></div>
                                            </div>
                                            <div class="card-body">
                                                <email-tel-data :personID="personid"></email-tel-data>
                                            </div>
                                         </div>
                                     </div>
                                </div>                                
    
                                <div class="row pt-md-4">      
                                     <div class="col">
                                         <div class="card">
                                            <div class="card-header">
                                                <div class="h5 mb-0"><h5>{{ $p.t('ui', 'betriebsmittel') }}</h5></div>        
                                            </div>
                                            <div class="card-body">
                                                <Betriebsmittel :person_id="personid" :uid="personuid" />
                                            </div>
                                         </div>
                                     </div>
                                </div>
    
                            </template>
                        </core-verticalsplit-cmpt>
		</div>    
`
});

handyVerwaltungApp.use(Phrasen).mount('#main');

