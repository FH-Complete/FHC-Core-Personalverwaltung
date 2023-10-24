import { Modal } from '../Modal.js';
import { CoreFilterAPIs } from '../../../../../../public/js/components/filter/API.js';

export const OrgViewer = {
    components: {
        "p-treetable": primevue.treetable,
        "p-column": primevue.column,
        "p-inputtext": primevue.inputtext,
        "p-skeleton": primevue.skeleton,
        "p-button": primevue.button,
        Modal,
    },
    props: {
       oe:  { type: String, required: true },
    },
    setup( props, context ) {

        const { toRefs, ref } = Vue;
        let { oe } = toRefs(props);
        const selection = ref({});
        const filters = ref({});

        const nodes = ref({});
        const expandedKeys = ref({});
        const isFetching = ref(false);
        const currentValue = ref({});
        const currentPersons = ref([]);

        const fetchOrg = async (oe) => {
            try {
       
              let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;                 

              const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getOrgStructure?oe=${oe}`;
        
              isFetching.value = true  
              const res = await fetch(url)
              let response = await res.json()    
              isFetching.value = false                          
              return { response };
            } catch (error) {
              console.log(error)        
              isFetching.value = false        
            }	
        }  
        
        const fetchPersons = async (oe) => {
            try {
       
              let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;                 
              const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getOrgPersonen?oe=${oe}`;        
              const res = await fetch(url)
              let response = await res.json()    
              return { response };
            } catch (error) {
              console.log(error)        
              isFetching.value = false        
            }	
        }

        const expandAll = () => {
            for (let node of nodes.value) {
                expandNode(node);
            }

            expandedKeys.value = {...expandedKeys.value};
        }

        const collapseAll = () => {
            expandedKeys.value = {};
        }
        
        const expandNode = (node) => {
            if (node.children && node.children.length) {
                expandedKeys.value[node.key] = true;

                for (let child of node.children) {
                    expandNode(child);
                }
            }
        }                  

        // Modal 
        let modalRef = Vue.ref();

        const showModal = (d) => {
            console.log(d);
            currentValue.value = d;
            modalRef.value.show();
            const result = fetchPersons(d.oe_kurzbz).then((data) => {
                console.log(data.response);
                currentPersons.value = data.response.retval;
            })
        }

        const hideModal = () => {
            modalRef.value.hide();
            currentValue.value = {};
            currentPersons.value = [];
        }

        const okHandler = () => {            
            hideModal();
        }
 

        Vue.watch(oe, (currentVal, oldVal) => {            
            const result = fetchOrg(currentVal).then((data) => {
                nodes.value = [data.response];
                expandedKeys.value[nodes.value[0].key] = true;
                
              }
            )
            
        });

        const redirect2person = ( person_id, uid ) => {
            let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	
            window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${person_id}/${uid}`;
        }

        const getLink = ( person_id, uid ) => {
            let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;	
            return `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees/${person_id}/${uid}`;
        }

        const filterOrg = ( oe_kurzbz ) => {
            console.log('filter oe: ', oe_kurzbz);
            // note: this only works if the filter contains a field with the name 'Standardkst.Kurz'
            const filterFields = {
                "filterUniqueId":"extensions/FHC-Core-Personalverwaltung/Employees/index",
                "filterType":"EmployeeViewer",
                "filterFields":[{"name":"OE Key","operation":"equal","condition":oe_kurzbz}]
            };
            CoreFilterAPIs.applyFilterFields(filterFields).then(function() {
                // redirect
                let protocol_host = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
                window.location.href = `${protocol_host}/extensions/FHC-Core-Personalverwaltung/Employees`;
            });
        }
      

        Vue.onMounted(() => {
            console.log('OrgViewer organisation mounted');
        })

        context.expose({ expandAll, collapseAll })
        
        return { nodes, selection, filters, expandedKeys, expandAll, collapseAll, isFetching,
            showModal, hideModal, modalRef, okHandler, currentValue, currentPersons, redirect2person, getLink, filterOrg }
    },
    template: `    
    
    <p-treetable :value="nodes" :filters="filters"  :expandedKeys="expandedKeys" class="p-treetable-sm" filterMode="strict" >
        <p-column field="bezeichnung" header="Bezeichnung" :expander="true" style="width:450px" filterMatchMode="contains" >
            <template #filter>
                <p-inputtext type="text" v-model="filters['bezeichnung']" class="p-column-filter" placeholder="Filter Bezeichnung"></p-inputtext>
            </template>
            <template #body  v-if="isFetching">
                <p-skeleton style="display: inline-block; width:80%"></p-skeleton>
            </template>
            <template #body="slotProps" v-if="!isFetching">          
                <a href="#" @click="filterOrg(slotProps.node.data.oe_kurzbz)">{{ slotProps.node.data.bezeichnung }}</a>
            </template>
        </p-column>
        <p-column field="organisationseinheittyp_kurzbz" header="Typ" style="width:150px" filterMatchMode="contains">
            <template #filter>
                <p-inputtext type="text" v-model="filters['organisationseinheittyp_kurzbz']" class="p-column-filter" placeholder="Filter Typ" style="width:150px"></p-inputtext>
            </template>
            <template #body  v-if="isFetching">
                <p-skeleton></p-skeleton>
            </template>            
        </p-column>
        <p-column field="leitung" header="Leitung" style="width:300px" filterMatchMode="contains">
            <template #filter>
                <p-inputtext type="text" v-model="filters['leitung']" class="p-column-filter" placeholder="Filter Leitung"></p-inputtext>
            </template>
            <template #body="slotProps" v-if="!isFetching">
                <span v-for="(item, index) in slotProps.node.data.leitung_array.data">
                    <span v-if="index!=0"> | </span>
                    <a :href="getLink(item.person_id, item.uid)">{{ item.name }}</a>
                </span>
            </template>
            <template #body  v-if="isFetching">
                <p-skeleton></p-skeleton>
            </template>            
        </p-column>
        <p-column field="assistenz" header="Assistenz" style="width:250px" filterMatchMode="contains">
            <template #filter>
                <p-inputtext type="text" v-model="filters['assistenz']" class="p-column-filter" placeholder="Filter Assistenz"></p-inputtext>
            </template>
            <template #body  v-if="isFetching">
                <p-skeleton></p-skeleton>
            </template>
            <template #body="slotProps" v-if="!isFetching">
                <span v-for="(item, index) in slotProps.node.data.assistenz_array.data">
                    <span v-if="index!=0"> | </span>
                    <a :href="getLink(item.person_id,item.uid)">{{ item.name }}</a>
                </span>
            </template>
        </p-column>
        <p-column headerStyle="width: 3rem" headerClass="text-center" bodyClass="text-center">
                <template #header>                    
                </template>
                <template #body="slotProps">  
                    <button type="button" class="btn btn-outline-dark "  @click="showModal(slotProps.node.data)">
                            <i class="fa fa-info"></i>
                    </button>
                </template>
        </p-column>
        
    </p-treetable>

    <Modal title="Organisationseinheit" ref="modalRef">
            <template #body>
                <div >
                    <form class="row g-2" ref="orgFrm">
                        <div class="col-md-8">
                            <label for="bezeichnung" class="form-label">Bezeichnung</label>
                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="bezeichnung" v-model="currentValue.bezeichnung">
                        </div>            
                        <div class="col-md-4">
                            <label for="typ" class="form-label">Typ</label>
                            <input type="text" readonly class="form-control-sm form-control-plaintext " id="typ" v-model="currentValue.organisationseinheittyp_kurzbz">
                        </div>
                        <div class="col-md-12">
                            <br>
                            <label for="typ" class="form-label">Mitarbeiter</label>
                            <table  class="table  table-hover">
                                <tbody>
                                    <tr v-for="p in currentPersons" @click="redirect2person(p.person_id,p.uid)">
                                        <td><b>{{ p.nachname }}</b>, {{ p.vorname }} {{ p.titelpre}} {{ p.titelpost }}</td>
                                        <td>{{ p.funktionen.join(', ') }} </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                    </form>
                </div>

            </template>
            <template #footer>                
                <button class="btn btn-primary"  @click="okHandler()">OK</button>
            </template>
    </Modal>
    `
}