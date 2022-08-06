const OrgViewer = {
    components: {
        "p-treetable": primevue.treetable,
        "p-column": primevue.column,
        "p-inputtext": primevue.inputtext,
        "p-skeleton": primevue.skeleton,
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

        Vue.watch(oe, (currentVal, oldVal) => {            
            const result = fetchOrg(currentVal).then((data) => {
                nodes.value = [data.response];
                expandedKeys.value[nodes.value[0].key] = true;
                
              }
            )
            
        });
      

        Vue.onMounted(() => {
            console.log('OrgViewer organisation mounted');
        })

        context.expose({ expandAll, collapseAll })
        
        return { nodes, selection, filters, expandedKeys, expandAll, collapseAll, isFetching }
    },
    template: `    
    
    <p-treetable :value="nodes" :filters="filters"  :expandedKeys="expandedKeys" class="p-treetable-sm" filterMode="strict" >
        <p-column field="bezeichnung" header="Bezeichnung" :expander="true" style="width:400px" filterMatchMode="contains" >
            <template #filter>
                <p-inputtext type="text" v-model="filters['bezeichnung']" class="p-column-filter" placeholder="Filter Bezeichnung"></p-inputtext>
            </template>
            <template #body  v-if="isFetching">
                <p-skeleton style="display: inline-block; width:80%"></p-skeleton>
            </template>
        </p-column>
        <p-column field="organisationseinheittyp_kurzbz" header="Typ" style="width:200px" filterMatchMode="contains">
            <template #filter>
                <p-inputtext type="text" v-model="filters['organisationseinheittyp_kurzbz']" class="p-column-filter" placeholder="Filter Typ"></p-inputtext>
            </template>
            <template #body  v-if="isFetching">
                <p-skeleton></p-skeleton>
            </template>
        </p-column>
        <p-column field="leitung" header="Leitung" style="width:300px" filterMatchMode="contains">
            <template #filter>
                <p-inputtext type="text" v-model="filters['leitung']" class="p-column-filter" placeholder="Filter by Leitung"></p-inputtext>
            </template>
            <template #body  v-if="isFetching">
                <p-skeleton></p-skeleton>
            </template>
        </p-column>
        <p-column field="assistenz" header="Assistenz" style="width:300px" filterMatchMode="contains">
            <template #filter>
                <p-inputtext type="text" v-model="filters['assistenz']" class="p-column-filter" placeholder="Filter by Assistenz"></p-inputtext>
            </template>
            <template #body  v-if="isFetching">
                <p-skeleton></p-skeleton>
            </template>
        </p-column>
        
    </p-treetable>
    `
}