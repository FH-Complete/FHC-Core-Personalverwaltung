// path to CI-Router without host and port (requires https!)
const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

export const SearchExistingDialog = {
    components: {
 
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
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }


        const filterPerson = async () => {
            
            emit('change', currentValue );

            if (currentValue.surname.length<=2) {
                personList.value = [];
                return;
            }
            

            try {
                let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router; 
                console.log('filter existing surname=' + currentValue.surname);
                const endpoint = `${full}/extensions/FHC-Core-Personalverwaltung/api/filterPerson`;
                isFetching.value = true;

                const res = await fetch(endpoint,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(currentValue),
                });   

                if (!res.ok) {
                    isFetching.value = false;
                    const message = `An error has occured: ${res.status}`;
                    throw new Error(message);
                }

			    let response = await res.json();
                isFetching.value = false;              
			    console.log(response.retval);	  
			    personList.value = response.retval;

            } catch (error) {
                console.log(error);
                isFetching.value = false;           
            }	
        };
        

        const personSelectedHandler = (id, uid) => {
			console.log('personSelected: ', id);			
			let url = `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Employees/${id}/${uid}/summary`;
			router.push(url);
            emit('select', uid );
		}

        // create new employee based on student
        const take = async (person_id, uid) => {
                                
            // submit
            isFetching.value = true
            let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;

            const endpoint =
                `${full}/extensions/FHC-Core-Personalverwaltung/api/createEmployee`;

            const res = await fetch(endpoint,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "take", payload: { person_id, uid}}),
            });    

            if (!res.ok) {
                isFetching.value = false;
                const message = `An error has occured: ${res.status}`;
                throw new Error(message);
            }
            let response = await res.json();
        
            isFetching.value = false;                
            personSelectedHandler(person_id, response.retval.uid);
                    
        }


        const reset = () => {
            currentValue.surname = null;
            currentValue.birthdate = null;
            personList.value = [];
        }

        Vue.onMounted(() => {
            console.log('SearchExistingDialog mounted');
            surnameRef.value.focus();
            
        })


        return {  currentValue, filterPerson, personSelectedHandler, personList, surnameRef, take, reset  };
    },
    template: `
    <form class="row g-3" ref="searchExistingFrm" id="searchExistingFrm" >

        <div class="col-md-3">
            <label for="surname" class="required form-label">Nachname</label>
            <input id="surname" 
                ref="surnameRef"
                v-model="currentValue.surname" 
                @keyup="filterPerson"
                type="text" 
                class="form-control form-control-sm" 
                placeholder="Nachname" aria-label="nachname"
                autofocus >
        </div>
        <div class="col-md-9"></div>
        <div class="col-md-3">
            <label for="birthdate" class="form-label">Geburtsdatum</label>
            <input id="birthdate"
                type="date"  
                class="form-control form-control-sm"   
                v-model="currentValue.birthdate" 
                @change="filterPerson" >
        </div>
        <div class="col-md-9"></div>
        <div class="col-md-12">
            <h5>Prüfung ob Person bereits existiert</h5>
            <p>{{ personList.length }} Übereinstimmungen</p>
            <table class="table table-sm table-striped table-hover">
                <thead>
                    <tr><th>UID</th><th>Nachname</th><th>Vorname</th><th>Geb.Dat.</th><th>SVNr</th><th>Status</th><th>Aktion</th></tr>
                </thead>
                <tbody>
                    <tr v-for="person in personList"  @click="personSelectedHandler(person.person_id, person.uid)">
                        <td>{{ person.uid }}</td>
                        <td>{{ person.nachname }}</td>
                        <td>{{ person.vorname }}</td>
                        <td>{{ person.gebdatum }}</td>
                        <td>{{ person.svnr }}</td>
                        <td>{{ person.status }}</td>
                        <td @click.stop>
                            <div class="d-grid gap-2 d-md-flex align-middle">
                                <button type="button" class="btn btn-outline-dark btn-sm" 
                                    @click="take(person.person_id, person.uid)"
                                    style="white-space: nowrap"
                                    v-if="person.status=='Student' && !person.taken">
                                    übernehmen
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