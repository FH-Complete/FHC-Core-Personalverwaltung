import ApiIssue from '../../api/factory/issueList.js';

export const IssuesCountCard = {
	name: 'IssuesCountCard',
     components: {
        "p-overlaypanel": primevue.overlaypanel,
        "p-datatable": primevue.datatable,
        "p-column": primevue.column,
     },
     props: {
     },
     setup( props ) {
        
        const $api = Vue.inject('$api');  
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Mitarbeiter*innen mit Issues");
        const issues = Vue.ref([]);
        const issuesOverlay = Vue.ref();
        const selectedPerson = Vue.ref();
        const filterActiveDV = Vue.ref(false);

        const toggle = (event) => {
            issuesOverlay.value.toggle(event);
        }

        const getOpenIssues = async () =>  {
            try {
                let res = await $api.call(ApiIssue.getPersonenMitOffenenIssues());
                issues.value = res.data;
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

        const issuesFiltered = Vue.computed(() => {
            if (filterActiveDV.value) {
                return  issues.value.filter(issue => issue.aktiv > 0)
            }
            return issues.value
        })
      
        return {
           issues, isFetching, title, toggle, issuesOverlay, onPersonSelect, selectedPerson, 
           filterActiveDV, issuesFiltered,
        }
     },
     template: `
     <div class="card" @click="toggle">
        <div class="card-header d-flex justify-content-between align-items-baseline">
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
         <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" role="switch" id="filterActiveDV" v-model="filterActiveDV">
            <label class="form-check-label" for="filterActiveDV">Nur aktive DV anzeigen</label>
         </div>
         <p-datatable v-model:selection="selectedPerson" :value="issuesFiltered" selectionMode="single" sortMode="multiple" :paginator="true" :rows="5" @row-select="onPersonSelect">
            <p-column field="vorname" header="Vorname" sortable style="min-width: 12rem"></p-column>
            <p-column field="nachname" header="Nachname" sortable style="min-width: 12rem"></p-column>
            <p-column field="openissues" header="Issues" sortable style="min-width: 8rem"></p-column>
            <p-column field="aktiv" header="Aktive DV" sortable style="min-width: 5rem"></p-column>          
        </p-datatable>
     </p-overlaypanel>
     
     `
   

}