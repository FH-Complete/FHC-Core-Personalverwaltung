const OrgViewer = {
    components: {
        Modal,
        "p-organizationchart": primevue.organizationchart,
    },
    props: {
       oe:  { type: String, required: true },
    },
    setup( props ) {

        const { toRefs, ref } = Vue;
        let { oe } = toRefs(props);
        const selection = ref({});

        const chartData = ref({});

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

        

        const isLeaf = (node) => {
            if (Array.isArray(node.children)) return true;
            return false;
        }

        /**
         * 
    {"gmbh": {
        "unit": {
            "oe_kurzbz": "gmbh",
            "oe_parent_kurzbz": null,
            "bezeichnung": "Technikum Wien GMBH",
            "organisationseinheittyp_kurzbz": "Abteilung",
            "aktiv": true,
            "mailverteiler": false,
            "freigabegrenze": "3000.00",
            "kurzzeichen": "GMB",
            "lehre": false,
            "standort": null,
            "warn_semesterstunden_frei": null,
            "warn_semesterstunden_fix": null,
            "standort_id": 0
        },
        "children": {
            "finconqm": {
                "unit": {
                    "oe_kurzbz": "finconqm",
                    "oe_parent_kurzbz": "gmbh",
                    "bezeichnung": "Finance & Controlling,QM & Prozessmanagement",
                    "organisationseinheittyp_kurzbz": "Team",
                    "aktiv": false,
                    "mailverteiler": false,
                    "freigabegrenze": null,
                    "kurzzeichen": null,
                    "lehre": false,
                    "standort": null,
                    "warn_semesterstunden_frei": null,
                    "warn_semesterstunden_fix": null,
                    "standort_id": 0
                },
                "children": []
            },}  
         * @returns 
         */
        const flattenDeep2 = (tree) => {
            const keys = Object.keys(tree);
            return keys.reduce((acc, oe) => {
                    if (!isLeaf(tree[oe])) {
                        const children_keys = Object.keys(tree[oe].children);
                        const links = children_keys.reduce(
                            (subacc, sub_oe) => { 
                                subacc.push([oe, sub_oe]); 
                                const child = tree[oe].children[sub_oe];
                                if (!isLeaf(child)) {
                                    const flat_child = flattenDeep2({[sub_oe]: child});
                                    subacc = subacc.concat(flat_child); 
                                }
                                
                                return subacc; 
                            },
                            []
                        );
                        return acc.concat(links);
                    }  
                    return acc;                    
                }, []
            );
         }

        var nodeLevel = 0;
        const flattenDeep = (tree) => {
            const keys = Object.keys(tree);
            nodeLevel++;
            return keys.reduce((acc, oe) => {
                /*
                    if (nodeLevel==6 && !isLeaf(tree[oe])) {
                        if (Object.keys(tree[oe].children).length>2) 
                            acc.push({ id: oe, name: tree[oe].unit.bezeichnung, title: tree[oe].unit.organisationseinheittyp_kurzbz , layout: 'hanging'}); 
                        else
                            acc.push({ id: oe, name: tree[oe].unit.bezeichnung, title: tree[oe].unit.organisationseinheittyp_kurzbz }); 
                    } else {
                        acc.push({ id: oe, name: tree[oe].unit.bezeichnung, title: tree[oe].unit.organisationseinheittyp_kurzbz }); 
                    }
                    */
                    acc.push({ id: oe, name: tree[oe].unit.bezeichnung /* title: oe tree[oe].unit.organisationseinheittyp_kurzbz*/, color: '#ff0000'}); 

                    if (!isLeaf(tree[oe])) {
                        const children_keys = Object.keys(tree[oe].children);
                        const links = children_keys.reduce(
                            (subacc, sub_oe) => {                                 
                                const child = tree[oe].children[sub_oe];
                                if (isLeaf(child)) {
                                    subacc.push({ id: sub_oe, name: child.unit.bezeichnung, title: child.unit.organisationseinheittyp_kurzbz, layout: 'hanging'}); 
                                } else {
                                    const flat_child = flattenDeep({[sub_oe]: child});
                                    subacc = subacc.concat(flat_child); 
                                }
                                
                                return subacc; 
                            },
                            []
                        );
                        return acc.concat(links);
                    }  
                    return acc;                    
                }, []
            );
         }

        Vue.watch(oe, (currentVal, oldVal) => {            
            const result = fetchOrg(currentVal).then((data) => {
                chartData.value = data.response;
              }
            )
            
        });
      

        Vue.onMounted(() => {
            console.log('OrgViewer organisation mounted');
        })

        const data1 = ref({
            key: "0",
            type: "person",
            styleClass: "p-person",
            data: { label: "CEO", name: "Walter White", avatar: "walter.jpg" },
            children: [
              {
                key: "0_0",
                type: "person",
                styleClass: "p-person",
                data: {
                  label: "CFO",
                  name: "Saul Goodman",
                  avatar: "saul.jpg"
                },
                children: [
                  {
                    key: "0_0_0",
                    data: { label: "Tax" },
                    selectable: false,
                    styleClass: "department-cfo"
                  },
                  {
                    key: "0_0_1",
                    data: { label: "Legal" },
                    selectable: false,
                    styleClass: "department-cfo"
                  }
                ]
              },
              {
                key: "0_1",
                type: "person",
                styleClass: "p-person",
                data: { label: "COO", name: "Mike E.", avatar: "mike.jpg" },
                children: [
                  {
                    key: "0_1_0",
                    data: { label: "Operations" },
                    selectable: false,
                    styleClass: "department-coo"
                  }
                ]
              },
              {
                key: "0_2",
                type: "person",
                styleClass: "p-person",
                data: {
                  label: "CTO",
                  name: "Jesse Pinkman",
                  avatar: "jesse.jpg"
                },
                children: [
                  {
                    key: "0_2_0",
                    data: { label: "Development" },
                    selectable: false,
                    styleClass: "department-cto",
                    children: [
                      {
                        key: "0_2_0_0",
                        data: { label: "Analysis" },
                        selectable: false,
                        styleClass: "department-cto"
                      },
                      {
                        key: "0_2_0_1",
                        data: { label: "Front End" },
                        selectable: false,
                        styleClass: "department-cto"
                      },
                      {
                        key: "0_2_0_2",
                        data: { label: "Back End" },
                        selectable: false,
                        styleClass: "department-cto"
                      }
                    ]
                  },
                  {
                    key: "0_2_1",
                    data: { label: "QA" },
                    selectable: false,
                    styleClass: "department-cto"
                  },
                  {
                    key: "0_2_2",
                    data: { label: "R&D" },
                    selectable: false,
                    styleClass: "department-cto"
                  }
                ]
              }
            ]
          });

        return { chartData, selection, data1 }
    },
    template: `
    
    <p-organizationchart
        :value="chartData"
        :collapsible="true"
        class="company"
        selection-mode="single"
        v-model:selection-keys="selection"        
    >
        <template #person="slotProps">
            <div class="node-header ui-corner-top">
            {{slotProps.node.data.oe_kurzbz}}
            </div>
            <div class="node-content">
            <img
                src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png"
                width="32"
            />
            <div>{{slotProps.node.data.organisationseinheittyp_kurzbz}}</div>
            </div>
        </template>
        <template #default="slotProps">
            <span v-if="slotProps.node.data != undefined" >{{slotProps.node.data.bezeichnung}}</span>
        </template>
    </p-organizationchart>
    `
}