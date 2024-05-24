import searchbar from "../../../../../js/components/searchbar/searchbar.js";
import {searchbaroptionsRestricted, searchfunction } from "../../apps/common.js";
import {CoreNavigationCmpt} from '../../../../../js/components/navigation/Navigation.js';
import fhcapifactory from "../../../../../js/apps/api/fhcapifactory.js";
import EmployeeEditor from "./EmployeeEditor.js";
import { CreateWizard } from './create/CreateWizard.js';
import { Toast } from '../Toast.js';

// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

export default {
    components: {
		Sidebar,
		EmployeeEditor,		
		CoreNavigationCmpt,
		searchbar,
		CreateWizard,
		Toast,
	},
    setup() {

		const { watch, ref } = Vue;
		const router = VueRouter.useRouter();
		const route = VueRouter.useRoute();
		const isEditorOpen = ref(false);
		const currentPersonID = ref(null);
		const currentPersonUID = ref(null);
		const appSideMenuEntries = ref({});
		const createWizardRef = ref();
		const toastEmployeeCreatedRef = ref();
		const toastEmployeeCreateFailedRef = ref();
		const currentDate = ref(null);

		watch(
			() => route.params,
			params => {
				currentPersonID.value = parseInt(params.id);
				currentPersonUID.value = params.uid;	
				console.log('*** EmployeeHome params changed', currentPersonID.value);				
			}
		)

		const personSelectedHandler = (id, uid, date) => {
			console.log('personSelected: ', id, uid, date);

			let url = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/restricted/Employees/${id}/${uid}` +(date!=null?`?d=${date}`:'');

			router.push(url);
		}

		const openCreateWizard = () => {
			createWizardRef.value.showModal().then((action) => {

				if (action !== false && action.type != "CANCELED") {
					showEmployeeCreatedToast()
				} else if (action === false) {
					showEmployeeCreateFailedToast()
				}
			})
		}
		
		const newSideMenuEntryHandler = (payload) => {
			appSideMenuEntries.value = payload;
		}

		const selectRecordHandler = (e, row) => { // Tabulator handler for the rowClick event
			personSelectedHandler(row.getData().PersonId, row.getData().UID, null);
		}

		

		const showEmployeeCreatedToast = () => {
            toastEmployeeCreatedRef.value.show();
        }

		const showEmployeeCreateFailedToast = () => {
			toastEmployeeCreateFailedRef.value.show();
		}

		Vue.onMounted(() => {
			let person_id = route.params.id;
			let person_uid = route.params.uid;
			console.log('EMPLOYEE APP CREATED; person_id=',person_id);
			if (person_id != null) {
				currentPersonID.value = parseInt(person_id);
				currentPersonUID.value = person_uid;
				//personSelectedHandler(parseInt(person_id));
				isEditorOpen.value = true;
			}
		})
		
		VueRouter.onBeforeRouteUpdate((to, from) => {
			/*console.log('onBeforeUpdate',to,from);
			const answer = window.confirm(
			  'Do you really want to leave? you have unsaved changes! (' + to + ', ' + from + ')' 
			)
			// cancel the navigation and stay on the same page
			if (!answer) return false*/
		  })

                searchbaroptionsRestricted.actions.employee.defaultaction = {
                    type: "function",
                    action: (data) => {
                        return personSelectedHandler(data.person_id, data.uid);
                    }
                };

		return {
			personSelectedHandler,
			newSideMenuEntryHandler,
			searchfunction,
			selectRecordHandler,
			openCreateWizard,			

			isEditorOpen,			
			currentPersonID,
			currentPersonUID,
			appSideMenuEntries,
			searchbaroptionsRestricted,
			toastEmployeeCreatedRef,
			toastEmployeeCreateFailedRef,
			route,
		}

	},
    template: `

        <header class="navbar navbar-expand-lg navbar-dark sticky-top bg-dark flex-md-nowrap p-0 border-bottom">
            <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="${FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router}">FHComplete [PV21]</a>
            <button class="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div id="chooser" class="w-100">
            <searchbar :searchoptions="searchbaroptionsRestricted" :searchfunction="searchfunction"></searchbar>
            </div>
            
        </header>

        <div class="container-fluid">
            <div class="row">
                
            <core-navigation-cmpt :add-side-menu-entries="appSideMenuEntries" hide-top-menu  left-nav-css-classes="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"></core-navigation-cmpt>

            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-3">
                <employee-editor  v-if="currentPersonID!=null" :personid="currentPersonID" :personuid="currentPersonUID" :open="isEditorOpen" @person-selected="(e) => personSelectedHandler(e.person_id, e.uid, e.date)" restricted ></employee-editor>
            </main>
            </div>
        </div>      		
		    
    `
}
