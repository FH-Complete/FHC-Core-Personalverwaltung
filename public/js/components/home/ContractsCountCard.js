import ApiCommon from '../../api/factory/common.js';
import ApiDV from '../../api/factory/dv.js';

export const ContractCountCard = {
	name: 'ContractCountCard',
     components: {
        "p-overlaypanel": primevue.overlaypanel,
        "p-datatable": primevue.datatable,
        "p-column": primevue.column,
        "InputText": primevue.inputtext,
        "MultiSelect": primevue.multiselect,
	"Calendar": primevue.calendar
     },
     props: {
        showNew: Boolean
     },
     setup( props ) {
        const $api = Vue.inject('$api');
        const contractDataNew = Vue.ref();
        const currentDate = Vue.ref(new Date());
        const currentMonth = Vue.ref(currentDate.value.getMonth()+1);
        const currentYear = Vue.ref(currentDate.value.getFullYear());
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Dienstantritte");
        const contractsOverlay = Vue.ref();
        const selectedPerson = Vue.ref();
        const filters = Vue.ref({
            global: { value: null, matchMode: primevue.api.FilterMatchMode.CONTAINS },
            vorname: { value: null, matchMode: primevue.api.FilterMatchMode.STARTS_WITH },
            nachname: { value: null, matchMode: primevue.api.FilterMatchMode.STARTS_WITH },
            vertragsart: { value: [], matchMode: primevue.api.FilterMatchMode.IN },
	    von: { value: null, matchMode: primevue.api.FilterMatchMode.DATE_IS },
	    bis: { value: null, matchMode: primevue.api.FilterMatchMode.DATE_IS }
        });
        const datumssort = (props.showNew) ? {field: 'von', order: 1} : {field: 'bis', order: 1};
        const defaultsortorder = [
            {field: 'vertragsart', order: 1},
            datumssort,
            {field: 'nachname', order: 1},
            {field: 'vorname', order: 1}
        ];

        const vertragsarten = Vue.ref([]);
        $api.call(ApiDV.getVertragsarten()).then((resp) => {
            let varts = [];
            let defaultfilter = ['Echter DV', 'Studentische Hilfskraft'];
            for( let vart of resp.retval) {
                varts.push(vart.label);
                if( defaultfilter.includes(vart.label) ) {
                    filters.value.vertragsart.value.push(vart.label);
                }
            }
            vertragsarten.value = varts;
        });

        const toggle = (event) => {
            contractsOverlay.value.toggle(event);
        }


        const formatDate = (ds) => {
            if( ds === null ) {
                return '-';
            }

	    if( ds instanceof Date ) {
                return ds.toLocaleDateString('de-AT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }

            var d = new Date(ds);
            var dd = ((d.getDate()).toString()).padStart(2, '0');
            var mm = ((d.getMonth() + 1).toString()).padStart(2, '0');
            return  dd + "." + mm + "." + d.getFullYear();
        }

        const capitalize = (s) => {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        
        const fetchContractsNew = async () => {
            const year = currentYear.value;
            const month = currentMonth.value;
            let response = null;

            try {
                isFetching.value = true;
                if (!props.showNew) {
                    title.value = "Dienstaustritte";
                    response = await $api.call(ApiCommon.getContractExpire(year, month));
                } else {
                    response = await $api.call(ApiCommon.getContractNew(year, month));
                }
                contractDataNew.value = response.retval.map((row) => {
                    row.von = (row.von === null) ? null : new Date(row.von);
                    row.bis = (row.bis === null) ? null : new Date(row.bis);
                    return row;
                });
            } catch (error) {
                console.log(error);
            } finally {
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
            contractDataNew, currentYear, currentMonth, isFetching, title,
            contractsOverlay, onPersonSelect, selectedPerson, toggle, filters,
            vertragsarten, formatDate, defaultsortorder
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

     <p-overlaypanel class="contractscountcards" ref="contractsOverlay">
        <p-datatable
            v-model:filters="filters"
            filterDisplay="row"
            :globalFilterFields="['vorname', 'nachname', 'vertragsart']"
            v-model:selection="selectedPerson"
            :value="contractDataNew"
            selectionMode="single"
            sortMode="multiple"
            :multiSortMeta="defaultsortorder"
            removeableSort
            :paginator="true"
            :rows="12"
            @row-select="onPersonSelect">
	    <template #empty> Keine Datensätze gefunden. </template>
            <p-column field="vorname" header="Vorname" sortable style="min-width: 12rem">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Vorname filtern" />
                </template>
            </p-column>
            <p-column field="nachname" header="Nachname" sortable style="min-width: 12rem">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Nachname filtern" />
                </template>
            </p-column>
            <p-column field="vertragsart" header="Vertragsart" sortable style="min-width: 12rem">
                <template #filter="{ filterModel, filterCallback }">
                    <MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="vertragsarten" placeholder="Vertragsarten filtern" class="p-column-filter" style="min-width: 14rem" :maxSelectedLabels="1">
                        <template #option="slotProps">
                            <div class="flex align-items-center gap-2">
                                <span>{{ slotProps.option }}</span>
                            </div>
                        </template>
                    </MultiSelect>
                </template>
            </p-column>
            <p-column field="von" header="DV-Beginn" dataType="date" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <span>{{ formatDate(data.von) }}</span>
                </template>
		<template #filter="{ filterModel, filterCallback }">
                    <Calendar v-model="filterModel.value" @date-select="filterCallback()" showIcon :showOnFocus="false" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" mask="99.99.9999" />
                </template>
            </p-column>
            <p-column field="bis" header="DV-Ende" dataType="date" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <span>{{ formatDate(data.bis) }}</span>
                </template>
		<template #filter="{ filterModel, filterCallback }">
                    <Calendar v-model="filterModel.value" @date-select="filterCallback()" showIcon :showOnFocus="false" dateFormat="dd.mm.yy" placeholder="dd.mm.yyyy" mask="99.99.9999" />
                </template>
            </p-column>
        </p-datatable>
     </p-overlaypanel>
     
     `
   

}
