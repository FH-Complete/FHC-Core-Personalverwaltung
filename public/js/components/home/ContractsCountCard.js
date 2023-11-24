const ContractCountCard = {
     components: {
        "p-overlaypanel": primevue.overlaypanel,
        "p-datatable": primevue.datatable,
        "p-column": primevue.column,
     },
     props: {
        showNew: Boolean
     },
     setup( props ) {
        
        const contractDataNew = Vue.ref();
        const currentDate = Vue.ref(new Date());
        const currentMonth = Vue.ref(currentDate.value.getMonth()+1);
        const currentYear = Vue.ref(currentDate.value.getFullYear());
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Dienstantritte");
        const contractsOverlay = Vue.ref();
        const selectedPerson = Vue.ref();

        const toggle = (event) => {
            contractsOverlay.value.toggle(event);
        }


        const formatDate = (ds) => {
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const capitalize = (s) => {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        
        const fetchContractsNew = async () => {
			try {
			  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;  
              
              let method = "getContractNew";
              if (!props.showNew) {
                method = "getContractExpire";
                title.value = "Dienstaustritte";
              }
			  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/${method}?month=${currentMonth.value}&year=${currentYear.value}`;
              isFetching.value = true;
			  const res = await fetch(url)
			  let response = await res.json();
              isFetching.value = false;              
			  console.log(response.retval);	  
			  contractDataNew.value = response.retval;			  
			} catch (error) {
			  console.log(error);
              isFetching.value = false;           
			}		
		}

        Vue.onMounted(() => {
            fetchContractsNew();
        })

        const onPersonSelect = (event) => {
            contractsOverlay.value.hide();
            let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	
            window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${event.data.person_id}/${event.data.uid}/summary`;
        }
      
        return {
            contractDataNew, currentYear, currentMonth, isFetching, title, contractsOverlay, onPersonSelect, selectedPerson, toggle,
        }
     },
     template: `
     <div class="card" @click="toggle">
        <div class="card-header d-flex justify-content-between align-items-baseline">
            <h5 class="mb-0">{{ title }}</h5>
                <span class="text-muted">{{currentMonth}}/{{ currentYear }}</span>
            </div>
            <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                 <span class="visually-hidden">Loading...</span>
            </div>            
            <h3 v-if="!isFetching">{{ contractDataNew?.length }}</h3>
        </div>
     </div>

     <p-overlaypanel ref="contractsOverlay">
        <p-datatable v-model:selection="selectedPerson" :value="contractDataNew" selectionMode="single" :paginator="true" :rows="5" @row-select="onPersonSelect">
            <p-column field="vorname" header="Vorname" sortable style="min-width: 12rem"></p-column>
            <p-column field="nachname" header="Nachname" sortable style="min-width: 12rem"></p-column>
        </p-datatable>
     </p-overlaypanel>
     
     `
   

}