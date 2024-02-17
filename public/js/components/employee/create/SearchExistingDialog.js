// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

export const SearchExistingDialog = {
    components: {
        "datepicker": VueDatePicker,
    },
    props: {
       
    },
    emits: ["change", "select", "take"],
    setup( props, { emit } ) {

        const router = VueRouter.useRouter();
    	const route = VueRouter.useRoute();

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

            if (currentValue.surname.length<2) {
                personList.value = [];
                return;
            }

            try {
                isFetching.value = true;
                const res = await Vue.$fhcapi.Employee.filterPerson(currentValue);                
                isFetching.value = false;              
			    console.log(res.data);	  
			    personList.value = res.data.retval;

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
                const res = await Vue.$fhcapi.Employee.createEmployee({ action: "take", payload: { person_id, uid, vorname, nachname}});             
                isFetching.value = false;    

                if (!res.data.error) {            
                    personSelectedHandler(person_id, res.data.retval.uid, 'take');
                    filterPerson();
                } else {
                    console.log("Fehler beim Anlegen: ", res.data.retval);
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
        <div class="col-md-3">
            <label for="birthdate" class="form-label">Geburtsdatum</label>
            <datepicker id="birthdate" 
                :teleport="true"
                v-model="currentValue.birthdate"
                v-bind:enable-time-picker="false"
                text-input 
                locale="de"
                format="dd.MM.yyyy"
                auto-apply 
                model-type="yyyy-MM-dd" 
                @change="filterPerson" ></datepicker>
        </div>
        <div v-if="personList.length !== 0" class="col-md-12 py-3">
            <span class="text-primary fw-semibold"><i class="fa fa-circle-info text-primary"></i>&nbsp;{{ personList.length }} Personen gefunden</span>
            <table class="table table-sm table-striped table-hover mt-2">
                <thead>
                    <tr><th>UID</th><th>Nachname</th><th>Vorname</th><th>Geb.Dat.</th><th>SVNr</th><th>Status</th><th>Aktion</th></tr>
                </thead>
                <tbody>
                    <tr v-for="person in personList"  @click="personSelectedHandler(person.person_id, person.uid, 'select')">
                        <td>{{ person.uid }}</td>
                        <td>{{ person.nachname }}</td>
                        <td>{{ person.vorname }}</td>
                        <td>{{ formatDate(person.gebdatum) }}</td>
                        <td>{{ person.svnr }}</td>
                        <td>{{ person.status }}</td>
                        <td @click.stop>
                            <div class="d-grid gap-2 d-md-flex justify-content-start">
                                <button type="button" class="btn btn-secondary btn-sm" 
                                    @click="take(person.person_id, person.uid, person.vorname, person.nachname)"
                                    style="white-space: nowrap"
                                    :disabled="isFetching"
                                    v-if="person.status=='Student' && !person.taken">
                                    Person als MA anlegen
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
