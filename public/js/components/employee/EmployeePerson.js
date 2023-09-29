import { BaseData } from './BaseData.js';
import { EmployeeData } from './EmployeeData.js';
import { BankData } from './BankData.js';
import { ContactData } from './contact/ContactData.js';
import { MaterialExpensesData } from './MaterialExpensesData.js';
import { HourlyRateData } from './HourlyRateData.js';
import { usePhrasen } from '../../../../../../public/js/mixins/Phrasen.js';

export const EmployeePerson = {
    components: {
		BaseData,
		EmployeeData,
		BankData,
		ContactData,
		MaterialExpensesData,
		HourlyRateData: HourlyRateData,
	},
    props: {
        // personid: { type: Number, default: 0 }
    },
    setup() {

        const route = VueRouter.useRoute();
        const currentPersonID = Vue.ref(0);
        const currentPersonUID = Vue.ref(null);
        const { t } = usePhrasen();
        const items = ["base", "employee", "contact", "bank", "material", "hourly"];
        const activeItem = Vue.ref("base");
       // const { personID } = Vue.toRefs(props);

        const isActive = (menuItem) => {
             return activeItem.value === menuItem;
        };

        const setActive = (menuItem) => {
            activeItem.value = menuItem;
            console.log("activeItem: ", menuItem);
        };

        Vue.watch(
			() => route.params,
			params => {
				currentPersonID.value = parseInt(params.id);
                currentPersonUID.value = params.uid;
			}
		)

        currentPersonID.value = parseInt(route.params.id);
        currentPersonUID.value = route.params.uid;
/*
        Vue.onMounted(() => {
            currentPersonID.value = parseInt(route.params.id);
            currentPersonUID.value = route.params.uid;
        })
*/
        return { items, isActive, setActive, currentPersonID, currentPersonUID, t }

    },
    template: `
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
      <div class="container-fluid">
        <div class="row pt-md-2">
            
            <nav class="nav flex-column col-md-2 subsubnav">
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[0]) }"
                    @click.prevent="setActive(items[0])"
                    href="#base"
                >{{ t('global', 'stammdaten') }}</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[1]) }"
                    @click.prevent="setActive(items[1])"
                    href="#employee"
                    >{{ t('person', 'mitarbeiterdaten') }}</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[2]) }"
                    @click.prevent="setActive(items[2])"
                    href="#contact"
                    >{{ t('person', 'kontaktdaten') }}</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[3]) }"
                    @click.prevent="setActive(items[3])"
                    href="#bank"
                    >{{ t('person', 'bankdaten') }}</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[4]) }"
                    @click.prevent="setActive(items[4])"
                    href="#bank"
                    >{{ t('person','sachaufwand') }}</a
                > 
				<a
					class="nav-link"
					:class="{ active: isActive(items[5]) }"
					@click.prevent="setActive(items[5])"
					href="#hourly"
					>{{ t('person', 'stundensaetze') }}</a
                >
            </nav>
            <div class="tab-content col-md-10" id="nav-tabContent">
                <div
                    class="tab-pane"
                    :class="{ active: isActive(items[0]) }"
                    role="tabpanel"
                >
                    <base-data editMode :personID="currentPersonID" :personUID="currentPersonUID"></base-data>
                </div>
                <div
                    class="tab-pane"
                    :class="{ active: isActive(items[1]) }"
                    role="tabpanel"
                >
                <employee-data editMode :personID="currentPersonID" :personUID="currentPersonUID"></employee-data>
                </div>
                <div
                    class="tab-pane"
                    :class="{ active: isActive(items[2]) }"
                    role="tabpanel"
                >
                    <contact-data editMode :personID="currentPersonID" :personUID="currentPersonUID"></contact-data>
                </div>
                <div
                    class="tab-pane"
                    :class="{ active: isActive(items[3]) }"
                    role="tabpanel"
                >
                <bank-data editMode :personID="currentPersonID" :personUID="currentPersonUID"></bank-data>
                </div>
                <div
                    class="tab-pane"
                    :class="{ active: isActive(items[4]) }"
                    role="tabpanel"
                >
                <material-expenses-data editMode :personID="currentPersonID"  :personUID="currentPersonUID"></material-expenses-data>
                </div>
				<div
					class="tab-pane"
					:class="{ active: isActive(items[5]) }"
					role="tabpanel"
				>
				<hourly-rate-data editMode :personID="currentPersonID"  :personUID="currentPersonUID"></hourly-rate-data>
				</div>
                
            </div>
        </div>
      </div>
    </div>
    `

}