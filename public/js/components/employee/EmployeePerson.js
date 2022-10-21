import { BaseData } from './BaseData.js';
import { EmployeeData } from './EmployeeData.js';
import { BankData } from './BankData.js';
import { ContactData } from './contact/ContactData.js';
import { MaterialExpensesData } from './MaterialExpensesData.js';

export const EmployeePerson = {
    components: {
		BaseData,
		EmployeeData,
		BankData,
		ContactData,
        MaterialExpensesData,
	},	
    props: {
        // personid: { type: Number, default: 0 }
    },
    setup() {

        const route = VueRouter.useRoute();
        const currentPersonID = Vue.ref(null);
        const currentPersonUID = Vue.ref(null);
        const items = ["base", "employee", "contact", "bank", "material"];
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
				currentPersonID.value = params.id;
                currentPersonUID.value = params.uid;
			}
		)

        Vue.onMounted(() => {
            currentPersonID.value = route.params.id;
            currentPersonUID.value = route.params.uid;
        })

        return { items, isActive, setActive, currentPersonID, currentPersonUID }

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
                >Stammdaten</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[1]) }"
                    @click.prevent="setActive(items[1])"
                    href="#employee"
                    >Mitarbeiterdaten</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[2]) }"
                    @click.prevent="setActive(items[2])"
                    href="#contact"
                    >Kontaktdaten</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[3]) }"
                    @click.prevent="setActive(items[3])"
                    href="#bank"
                    >Bankdaten</a
                >
                <a
                    class="nav-link"
                    :class="{ active: isActive(items[4]) }"
                    @click.prevent="setActive(items[4])"
                    href="#bank"
                    >Sachaufwand</a
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
                
            </div>
        </div>
      </div>
    </div>
    `

}