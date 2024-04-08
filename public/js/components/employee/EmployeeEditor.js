import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

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
        isNew:  Boolean,
    },
    emits: ['personSelected'],
    setup( props, {emit }) {

        const router = useRouter();
    	const route = useRoute();
        const currentPersonID = ref(null);
        const currentPersonUID = ref(null);
        const currentDate = ref(null);
        const employeeHeaderRef = ref();

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

        onMounted(() => {
			console.log('EmployeeEditor mounted', route.path);
            currentDate.value = route.query.d;
        })

        watch(
			() => route.params,
			params => {
				currentPersonID.value = params.id;
                currentPersonUID.value = params.uid;
			}
		)

        watch(
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
