import ApiCommon from '../../api/factory/common.js';

export const BirthdayCountCard = {
	name: 'BirthdayCountCard',
    components: {
        "p-overlaypanel": primevue.overlaypanel,
        "p-datatable": primevue.datatable,
        "p-column": primevue.column,
     },
     props: {
     },
     setup( ) {
        const $api = Vue.inject('$api');
        const birthdayData = Vue.ref();
        const currentDate = Vue.ref(new Date());
        const currentMonth = Vue.ref(currentDate.value.getMonth()+1);
        const currentYear = Vue.ref(currentDate.value.getFullYear());
        const isFetching = Vue.ref(false);
        const birthdayOverlay = Vue.ref();
        const selectedPerson = Vue.ref();

        const formatDate = (ds) => {
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const toggle = (event) => {
            birthdayOverlay.value.toggle(event);
        }


        const fetchBirthdays = async () => {
            try {
                let ts = Math.round(currentDate.value.getTime() / 1000);  // unix timestamp
                isFetching.value = true;
                const response = await $api.call(ApiCommon.getBirthdays(ts));
                birthdayData.value = response.data || [];
            } catch (error) {
                console.log(error);
            } finally {
                isFetching.value = false;
            }
        }

        Vue.onMounted(() => {
            fetchBirthdays();
        })

        const onPersonSelect = (event) => {
            birthdayOverlay.value.hide();
            let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	
            window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${event.data.person_id}/${event.data.uid}/summary`;
        }
      
        return {
            birthdayData, currentYear, currentMonth, isFetching, formatDate, currentDate, 
            toggle, birthdayOverlay, onPersonSelect, selectedPerson,
        }
     },
     template: `
     <div class="card" @click="toggle">
        <div class="card-header d-flex justify-content-between align-items-baseline">
            <h5 class="mb-0">Geburtstage</h5>
                <span class="text-muted">{{formatDate(currentDate)}}</span>
            </div>
            <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                 <span class="visually-hidden">Loading...</span>
            </div>            
            <h3 v-if="!isFetching">{{ birthdayData?.length }}</h3>
        </div>
     </div>

     <p-overlaypanel ref="birthdayOverlay">
         <p-datatable v-model:selection="selectedPerson" :value="birthdayData" selectionMode="single" :paginator="true" :rows="5" @row-select="onPersonSelect">
            <p-column field="vorname" header="Vorname" sortable style="min-width: 12rem"></p-column>
            <p-column field="nachname" header="Nachname" sortable style="min-width: 12rem"></p-column>
            <p-column field="age" header="Alter" sortable style="min-width: 12rem"></p-column>          
        </p-datatable>
     </p-overlaypanel>
     
     `
   

}