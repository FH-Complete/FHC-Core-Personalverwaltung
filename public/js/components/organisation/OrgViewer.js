const OrgViewer = {
    components: {
        Modal,
        "p-treetable": primevue.treetable,
        "p-column": primevue.column,
        "p-inputtext": primevue.inputtext,
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
       
              let protocol_host =
                location.protocol + "//" +
                location.hostname + ":" +
                location.port;                 

              const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getOrgStructure?oe=${oe}`;
        
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
    
    
    <p-treetable :value="nodes" :filters="filters"  :expandedKeys="expandedKeys" class="p-treetable-sm" filterMode="strict" v-if="!isFetching" >
        <p-column field="bezeichnung" header="Bezeichnung" :expander="true" style="width:300px" filterMatchMode="contains" >
            <template #filter>
                <p-inputtext type="text" v-model="filters['bezeichnung']" class="p-column-filter" placeholder="Filter Bezeichnung"></p-inputtext>
            </template>
        </p-column>
        <p-column field="organisationseinheittyp_kurzbz" header="Typ" style="width:300px" filterMatchMode="contains">
            <template #filter>
                <p-inputtext type="text" v-model="filters['organisationseinheittyp_kurzbz']" class="p-column-filter" placeholder="Filter Typ"></p-inputtext>
            </template>
        </p-column>
        <p-column field="leitung" header="Leitung" style="width:300px" filterMatchMode="contains">
            <template #filter>
                <p-inputtext type="text" v-model="filters['leitung']" class="p-column-filter" placeholder="Filter by Leitung"></p-inputtext>
            </template>
        </p-column>
        
    </p-treetable>
    `
}