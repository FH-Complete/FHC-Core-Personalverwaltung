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
    setup( props ) {

        const { toRefs, ref } = Vue;
        let { oe } = toRefs(props);
        const selection = ref({});
        const filters1 = ref({});
        const filters2 = ref({});

        const nodes = ref({});
        const expandedKeys = ref({});

        const fetchOrg = async (oe) => {
            try {
       
              let protocol_host =
                location.protocol + "//" +
                location.hostname + ":" +
                location.port;                 

              const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getOrgStructure?oe=${oe}`;
        
              const res = await fetch(url)
              let response = await res.json()                            
              return { response };
            } catch (error) {
              console.log(error)              
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

        

        return { nodes, selection, filters1, filters2, expandedKeys }
    },
    template: `
    
    <p-treetable :value="nodes" :filters="filters1"  :expandedKeys="expandedKeys" class="p-treetable-sm" filter-mode="lenient" >
        <!--template #header>
            <div class="text-right">
                <div class="p-input-icon-left">
                    <i class="pi pi-search"></i>
                    <p-inputtext v-model="filters1['global']" placeholder="Global Search" size="50"></p-inputtext>
                </div>
            </div>
        </template-->
        <p-column field="bezeichnung" header="Bezeichnung" :expander="true" style="width:300px">>
            <template #filter>
                <p-inputtext type="text" v-model="filters1['bezeichnung']" class="p-column-filter" placeholder="Filter Bezeichnung"></p-inputtext>
            </template>
        </p-column>
        <p-column field="organisationseinheittyp_kurzbz" header="Typ" style="width:300px">>
            <template #filter>
                <p-inputtext type="text" v-model="filters1['organisationseinheittyp_kurzbz']" class="p-column-filter" placeholder="Filter Typ"></p-inputtext>
            </template>
        </p-column>
        <p-column field="leitung" header="Leitung" style="width:300px">>
            <template #filter>
                <p-inputtext type="text" v-model="filters1['leitung']" class="p-column-filter" placeholder="Filter by Leitung"></p-inputtext>
            </template>
        </p-column>
        
    </p-treetable>
    `
}