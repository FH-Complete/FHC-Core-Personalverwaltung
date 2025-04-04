// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

export const SearchExistingDialog = {
	name: 'SearchExistingDialog',
    components: {
        "datepicker": VueDatePicker,
    },
    props: {
       
    },
    emits: ["change", "select", "take"],
    setup( props, { emit } ) {

        const router = VueRouter.useRouter();
    	const route = VueRouter.useRoute();
        const fhcApi = Vue.inject('$fhcApi');
        
        const currentValue = Vue.reactive({
            surname: "",
            birthdate: "",
        });

        const personList = Vue.ref([]);

        const isFetching = Vue.ref(false);

        const surnameRef = Vue.ref(null);

        const formatDate = (ds) => {
            if (ds == null || ds == '') return '';
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }


        const filterPerson = async () => {
            
            emit('change', currentValue );

            if (currentValue.surname.length<2 || currentValue.birthdate == null || currentValue.birthdate == '') {
                personList.value = [];
                return;
            }

            try {
                isFetching.value = true;
                const res = await fhcApi.factory.Employee.filterPerson(currentValue);                
                isFetching.value = false;              
			    console.log(res);	  
			    personList.value = res.retval;

            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
        };
        

        const personSelectedHandler = (id, uid, event) => {
			console.log('personSelected: ', id);			
			let url = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/${id}/${uid}/summary`;
			router.push(url);
            emit(event, uid );
		}
        

        // create new employee based on student
        const take = async (person_id, uid, vorname, nachname) => {                        

            try {
                isFetching.value = true
                const res = await fhcApi.factory.Employee.createEmployee({ action: "take", payload: { person_id, uid, vorname, nachname}});             
                isFetching.value = false;    

                if (!res.error) {            
                    personSelectedHandler(person_id, res.retval.uid, 'take');
                    filterPerson();
                } else {
                    console.log("Fehler beim Anlegen: ", res.retval);
                }

            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
            
        }


        const reset = () => {
            currentValue.surname = null;
            currentValue.birthdate = null;
            personList.value = [];
        }

        Vue.onMounted(() => {
            surnameRef.value.focus();            
        })


        return {  currentValue, filterPerson, personSelectedHandler, personList, surnameRef, take, reset, formatDate, isFetching  };
    },
    template: `
    <form class="row g-3 pb-4" ref="searchExistingFrm" id="searchExistingFrm" >

        <div class="col-md-3">
            <label for="birthdate" class="form-label required">Geburtsdatum</label>
            <datepicker id="birthdate" 
                :teleport="true"
                v-model="currentValue.birthdate"
                v-bind:enable-time-picker="false"
                text-input 
                locale="de"
                format="d.M.yyyy"
                auto-apply 
                model-type="yyyy-MM-dd" 
                @change="filterPerson" ></datepicker>
        </div>

        <div class="col-md-3">
            <label for="surname" class="required form-label">Nachname</label>
            <input id="surname" 
                ref="surnameRef"
                v-model="currentValue.surname" 
                @keyup="filterPerson"
                type="text" 
                class="form-control form-control-sm" 
                aria-label="nachname"
                autofocus >
        </div>
        
        <div v-if="personList.length !== 0" class="col-md-12 py-3">
            <span class="text-primary fw-semibold"><i class="fa fa-circle-info text-primary"></i>&nbsp;{{ personList.length }} Personen gefunden</span>
            <table class="table table-sm table-striped table-hover mt-2">
                <thead>
                    <tr><th>UID</th><th>Name</th><th>Geb.Dat.</th><th>SVNr</th><th>Email</th><th>Status</th><th>Unruly</th><th>Aktion</th></tr>
                </thead>
                <tbody>
                    <tr v-for="person in personList" >
                        <td>{{ person.uid }}</td>
                        <td>{{ person.nachname }}, {{ person.vorname }}</td>
                        <td>{{ formatDate(person.gebdatum) }}</td>
                        <td>{{ person.svnr }}</td>                        
                        <td><span v-if="person.emails.length > 0">{{ person.emails.join(", ") }}</span></td>
                        <td>{{ person.status }}</td>
                        <td>
                            <span v-if="person.unruly" class="badge bg-unruly rounded-0">Unruly</span>
                            <span v-else>-</span>
                        </td>
                        <td @click.stop>
                            <div class="d-grid gap-2 d-md-flex justify-content-start">
                                <button type="button" class="btn btn-secondary btn-sm" 
                                    @click="take(person.person_id, person.uid, person.vorname, person.nachname)"
                                    style="white-space: nowrap"
                                    :disabled="isFetching"
                                    v-if="!person.taken">
                                    Person als MA anlegen
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" 
                                    @click="personSelectedHandler(person.person_id, person.uid, 'select')"
                                    style="white-space: nowrap"
                                    :disabled="isFetching"
                                    v-if="person.taken">
                                    MA auswählen
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </form>
    `
}