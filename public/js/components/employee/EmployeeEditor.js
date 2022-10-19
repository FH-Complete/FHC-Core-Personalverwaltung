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
        personuid: String,
        open: Boolean,
        isNew:  Boolean        
    },
    setup( props, {emit }) {

        const router = VueRouter.useRouter();
    	const route = VueRouter.useRoute();
        const currentPersonID = Vue.ref(null);
        const currentPersonUID = Vue.ref(null);

        const redirect = (params) => {
            emit('personSelected', params);
        }

        Vue.onMounted(() => {
			console.log('EmployeeEditor mounted');
        })

        Vue.watch(
			() => route.params,
			params => {
				currentPersonID.value = params.id;
                currentPersonUID.value = params.uid;
			}
		)

        return { redirect, currentPersonID, currentPersonUID }
    },
    template: `      
        <EmployeeHeader  :personID="personid" :personUID="personuid" @person-selected="redirect" :edit-mode="true" ></EmployeeHeader> 
        <EmployeeNav  :personID="currentPersonID" :personUID="currentPersonUID" :edit-mode="true" ></EmployeeNav> 
        <router-view></router-view>       
    `
}