import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';
import { OffTime } from './OffTime.js';
import { TimeRecording } from './TimeRecording.js';

export const EmployeeTime = {
	name: 'EmployeeTime',
    components: {
        OffTime,
        TimeRecording,
    },
    props: {
    },
    setup() {


        const route = VueRouter.useRoute();
        const { watch, ref, onMounted } = Vue; 
        const currentPersonID = ref(null);
        const currentUID = ref(null);
        const isFetching = ref(false);
        const items = ["offtime", "timerecording"];
        const activeItem = Vue.ref("offtime");
        const { t } = usePhrasen();

        onMounted(() => {
            currentPersonID.value = parseInt(route.params.id);
            currentUID.value = route.params.uid;
        })

        watch(
			() => route.params.id,
			newId => {
				currentPersonID.value = parseInt(newId);
			}
		)

        watch(
			() => route.params.uid,
			newId => {
				currentUID.value = newId;
			}
		)

        const isActive = (menuItem) => {
            return activeItem.value === menuItem;
       }

       const setActive = (menuItem) => {
           activeItem.value = menuItem;
           console.log("activeItem: ", menuItem);
       }


        return {currentPersonID, currentUID, isFetching, items, isActive, setActive,t}
    },
    template: `
    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">
        <div class="container-fluid px-1">

            <div class="row pt-md-2">
            
                <nav class="nav flex-column col-md-2 subsubnav">
                    <a
                        class="nav-link"
                        :class="{ active: isActive(items[0]) }"
                        @click.prevent="setActive(items[0])"
                        href="#base"
                    >{{ t('person', 'abwesenheiten') }}</a
                    >
                    <a
                        class="nav-link"
                        :class="{ active: isActive(items[1]) }"
                        @click.prevent="setActive(items[1])"
                        href="#employee"
                        >{{ t('person', 'zeiterfassung') }}</a
                    >                   
                </nav>
                <div class="tab-content col-md-10" id="nav-tabContent">


                    <div
                    class="tab-pane"
                    :class="{ active: isActive(items[0]) }"
                    role="tabpanel"
                    >
                        <off-time :personID="currentPersonID" :personUID="currentUID" ></off-time>
                    </div>
                    <div
                        class="tab-pane"
                        :class="{ active: isActive(items[1]) }"
                        role="tabpanel"
                    >
                        <time-recording :personID="currentPersonID" :personUID="currentUID" ></time-recording>
                    </div>

                </div>

            </div>
                               
        </div>

    </div>

    `
}