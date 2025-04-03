import { EmployeePerson } from './EmployeePerson.js';
import { EmployeeHeader } from './EmployeeHeader.js';
import { EmployeeNav } from './EmployeeNav.js';

export default {
	name: 'EmployeeEditor',
    components: {
        EmployeePerson,
        EmployeeHeader,
        EmployeeNav,
    },
    props: {
        personid: Number,
        personuid: String,
        open: Boolean,
        isNew:  Boolean,
    },
    emits: ['personSelected'],
    setup( props, {emit }) {

        const router = VueRouter.useRouter();
    	const route = VueRouter.useRoute();
        const currentPersonID = Vue.ref(null);
        const currentPersonUID = Vue.ref(null);
        const currentDate = Vue.ref(null);
        const employeeHeaderRef = Vue.ref();

        const redirect = (params) => {
            emit('personSelected', params);
        }

        const dateChanged = (params) => {
            console.log("-> date changed: ", params);
            //currentDate.value=params;
        }

        const updateHeaderHandler = () => {
            employeeHeaderRef.value.refresh();
        }

        Vue.onMounted(() => {
			console.log('EmployeeEditor mounted', route.path);
            currentDate.value = route.query.d;
        })

        Vue.watch(
			() => route.params,
			params => {
				currentPersonID.value = params.id;
                currentPersonUID.value = params.uid;
			}
		)

        Vue.watch(
			() => route.query.d,
			d => {
                console.log('watch route.query.d', d)
				currentDate.value = d;
			}
		)

        return { redirect, dateChanged, currentPersonID, currentPersonUID, currentDate, employeeHeaderRef, updateHeaderHandler }
    },
    template: `    
        <EmployeeHeader ref="employeeHeaderRef"  :personID="personid" :personUID="personuid" @person-selected="redirect"   ></EmployeeHeader> 
        <EmployeeNav   :personID="currentPersonID" :personUID="currentPersonUID"  ></EmployeeNav> 
        <router-view @updateHeader="updateHeaderHandler"></router-view>       
    `
}
