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
        // personid: { type: Number, default: 0 }
    },
    emits: ['updateHeader'],
    setup(_, { emit }) {

        const route = VueRouter.useRoute();
        const currentPersonID = Vue.ref(0);
        const currentPersonUID = Vue.ref(null);
        const { t } = usePhrasen();
        const items = ["base", "employee", "contact", "bank", "material", "hourly", "funktion"];
        const activeItem = Vue.ref("base");
        const theModel = Vue.reactive({personID: null, personUID: null,editmode: true, updateHeader: () => emit('updateHeader')});

        const isActive = (menuItem) => {
             return activeItem.value === menuItem;
        };

        const setActive = (menuItem) => {
            activeItem.value = menuItem;
            console.log("activeItem: ", menuItem);
        };

        currentPersonID.value = parseInt(route.params.id);
        currentPersonUID.value = route.params.uid;
        theModel.personID = parseInt(route.params.id);
        theModel.personUID = route.params.uid;

        return { items, isActive, setActive, currentPersonID, currentPersonUID, t, theModel }

    },
    template: `
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid">
    
        <fhc-tabs 
            config="/extensions/FHC-Core-Personalverwaltung/apis/TabsConfig/Stammdaten" 
            style="flex: 1 1 0%; height: 0%"
            :vertical="true"
            v-model="theModel">
        </fhc-tabs>

      </div>
    </div>
    `

}

export default EmployeePerson;