const OrgViewer = {
    components: {
        Modal,
    },
    props: {
       oe:  { type: String, required: true },
    },
    setup( props ) {
        let { oe } = Vue.toRefs(props);

        const chartData = Vue.ref([]);
        const chartNodes = Vue.ref([]);

        const chartOptions = Vue.computed(() => ({          
            chart: {
                height: 3900, // 3900
                inverted: true
              },
            
              title: {
                text: ''
              },

              series: [{
                type: 'organization',
                name: 'Technikum Wien',
                animation: false,
                keys: ['from', 'to'],
                data: chartData.value,
                levels: [{
                  level: 0,
                  color: 'silver',
                  dataLabels: {
                    color: 'black'
                  },
                  height: 35
                }, {
                  level: 1,
                  //color: 'red',
                  dataLabels: {
                    color: 'white',
                    useHTML: true
                  },
                  height: 35
                }, {
                  level: 2,
                  color: '#980104'
                }, {
                  level: 4,
                  color: '#359154'
                },{
                    level: 5,
                    color: '#659154'
                  },

                ],
                nodes: chartNodes.value,
                colorByPoint: false,
                color: '#007ad0',
                linkColor: "#ccc",
                linkLineWidth: 2,
                dataLabels: {
                  color: 'white',
                  nodeFormatter() {
                        // There seems to be a bug with larger datasets which prevents the dataLabels style option from overriding the default h4 font size, so I format the nodes here instead
                        const html = (Highcharts.defaultOptions.plotOptions.organization.dataLabels).nodeFormatter.call(this);
                        return html.replace(
                            '<h4 style="',
                            '<h4 style="font-size: 0.8rem;margin:0"'
                        );
                    }
                },
                borderColor: 'white',
                nodeWidth: 65
              }],
              tooltip: {
                outside: true,
                formatter: function() {
                    return this.point.info;
                }
              },
              exporting: {
                allowHTML: true,
                sourceWidth: 800,
                sourceHeight: 600
              }


            
          })
        );

        const fetchOrg = async (oe) => {
            try {
       
              let protocol_host =
                location.protocol + "//" +
                location.hostname + ":" +
                location.port;                 

              const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/v1/OrgAPI/getOrgStructure?oe=${oe}`;
        
              const res = await fetch(url)
              let response = await res.json()              
              console.log(response.retval);	 
              nodeLevel = 0;
              const seriesdata = flattenDeep2(response); 
              const nodes = flattenDeep(response);
              return { seriesdata: seriesdata, nodes: nodes};
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
                chartData.value = data.seriesdata;
                chartNodes.value = data.nodes;
                }
            )
            
        });
      

        Vue.onMounted(() => {
            console.log('OrgViewer organisation mounted');
        })

        return { chartOptions }
    },
    template: `

        <div style="width:100%;height:100%;overflow:auto">
            <figure style="min-width:500%;">
                <highcharts class="chart" :options="chartOptions"></highcharts>
            </figure>
        </div>
    `
}