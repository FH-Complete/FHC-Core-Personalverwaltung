import { BaseData } from './BaseData.js';
import { EmployeeData } from './EmployeeData.js';
import { BankData } from './BankData.js';
import { ContactData } from './contact/ContactData.js';
import { MaterialExpensesData } from './MaterialExpensesData.js';
import { HourlyRateData } from './HourlyRateData.js';
import { JobFunction } from './JobFunction.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';
import FhcTabs from '../../../../../../public/js/components/Tabs.js';

export const EmployeePerson = {
    components: {
		BaseData,
		EmployeeData,
		BankData,
		ContactData,
		MaterialExpensesData,
		HourlyRateData: HourlyRateData,
        JobFunction,
        FhcTabs,
	},
    props: {
        id: Number,
        uid: String,
    },
    emits: ['updateHeader'],
    setup(props, { emit }) {

        const { t } = usePhrasen();
        const theModel = Vue.reactive({personID: null, personUID: null,editmode: true, updateHeader: () => emit('updateHeader')});
        const path = Vue.ref("/extensions/FHC-Core-Personalverwaltung/apis/TabsConfig/Stammdaten")

        theModel.personID = props.id
        theModel.personUID = props.uid
        theModel.restricted = props.restricted

        return { t, theModel, path }

    },
    template: `
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid">
    
        <fhc-tabs 
            :config="path" 
            style="flex: 1 1 0%; height: 0%"
            :vertical="true"
            v-model="theModel">
        </fhc-tabs>

      </div>
    </div>
    `

}

export default EmployeePerson;