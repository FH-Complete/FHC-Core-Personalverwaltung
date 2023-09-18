const IssuesCountCard = {
     components: {
        "p-overlaypanel": primevue.overlaypanel,
        "p-datatable": primevue.datatable,
        "p-column": primevue.column,
     },
     props: {
     },
     setup( props ) {
        
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Mitarbeiter*innen mit Issues");
        const issues = Vue.ref([]);
        const issuesOverlay = Vue.ref();
        const selectedPerson = Vue.ref();

        const toggle = (event) => {
            issuesOverlay.value.toggle(event);
        }

        const getOpenIssues = async () =>  {
            try {
                let res = await Vue.$fhcapi.Issue.openIssuesPersons();
                issues.value = res.data.retval;
                return res;
            } catch(error) {
                console.log(error);
            }
            return null;
        }

        Vue.onMounted(() => {
            getOpenIssues();
        })

        const onPersonSelect = (event) => {
            issuesOverlay.value.hide();
            let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	
            window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${event.data.person_id}/${event.data.uid}/summary`;
        }
      
        return {
           issues, isFetching, title, toggle, issuesOverlay, onPersonSelect, selectedPerson,
        }
     },
     template: `
     <div class="card" @click="toggle">
        <div class="card-header">
            <h5 class="mb-0">{{ title }}</h5>
                &nbsp;
            </div>
            <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                 <span class="visually-hidden">Loading...</span>
            </div>            
            <h3 v-if="!isFetching">{{ issues?.length }}</h3>
        </div>
     </div>

     <p-overlaypanel ref="issuesOverlay">
         <p-datatable v-model:selection="selectedPerson" :value="issues" selectionMode="single" :paginator="true" :rows="5" @row-select="onPersonSelect">
            <p-column field="vorname" header="Vorname" sortable style="min-width: 12rem"></p-column>
            <p-column field="nachname" header="Nachname" sortable style="min-width: 12rem"></p-column>
            <p-column field="openissues" header="Issues" sortable style="min-width: 12rem"></p-column>          
        </p-datatable>
     </p-overlaypanel>
     
     `
   

}