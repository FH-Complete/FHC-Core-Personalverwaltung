import { EmployeePerson } from './EmployeePerson.js';
import { EmployeeHeader } from './EmployeeHeader.js';
import { EmployeeNav } from './EmployeeNav.js';

export default {
    components: {
        EmployeePerson,
        EmployeeHeader,
        EmployeeNav,
    },
    props: {
        personid: Number,
        open: Boolean,
        isNew:  Boolean
    },
    setup( props, {emit }) {

        const router = VueRouter.useRouter();
    	const route = VueRouter.useRoute();
        const currentPersonID = Vue.ref(null);

        const redirect = (person_id) => {
            emit('personSelected', person_id);
        }

        Vue.onMounted(() => {
			console.log('EmployeeEditor mounted');
        })

        Vue.watch(
			() => route.params.id,
			newId => {
				currentPersonID.value = newId;
			}
		)

        return { redirect, currentPersonID }
    },
    template: `
        <EmployeeHeader  :personID="personid" @person-selected="redirect" :edit-mode="true" ></EmployeeHeader>
        <EmployeeNav  :personID="personid" :edit-mode="true" ></EmployeeNav> 

        <router-view></router-view>

    `
}
