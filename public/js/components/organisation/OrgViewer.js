const OrgViewer = {
    components: {
        Modal,
    },
    props: {
       oe:  { type: String, required: true },
    },
    setup( props ) {
        let { oe } = Vue.toRefs(props);

        const chartOptions = Vue.reactive({            
            chart: {
                height: 600,
                inverted: true
              },
            
              title: {
                text: 'Technikum Wien'
              },
            

              series: [{
                type: 'organization',
                name: 'Technikum Wien',
                animation: false,
                keys: ['from', 'to'],
                data: [
                  ['Shareholders', 'Board'],
                  ['Board', 'CEO'],
                  ['CEO', 'CTO'],
                  ['CEO', 'CPO'],
                  ['CEO', 'CSO'],
                  ['CEO', 'HR'],
                  ['CTO', 'Product'],
                  ['CTO', 'Web'],
                  ['CSO', 'Sales'],
                  ['HR', 'Market'],
                  ['CSO', 'Market'],
                  ['HR', 'Market'],
                  ['CTO', 'Market']
                ],
                levels: [{
                  level: 0,
                  color: 'silver',
                  dataLabels: {
                    color: 'black'
                  },
                  height: 125
                }, {
                  level: 1,
                  color: 'red',
                  dataLabels: {
                    color: 'black',
                    useHTML: true
                  },
                  height: 125
                }, {
                  level: 2,
                  color: '#980104'
                }, {
                  level: 4,
                  color: '#359154'
                }],
                nodes: [{
                  id: 'Shareholders'
                }, {
                  id: 'Board',
                  info: 'sadf asdfas<br> asdfsd asdf<br> asdfsd asdf<br> asdfsd asdf<br> asdfsd asdf<br> asdfsd asdf'
                }, {
                  id: 'CEO',
                  title: 'CEO',
                  name: 'Grethe Hjetland',
                  image: 'https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2020/03/17131126/Highsoft_03862_.jpg',
                  info: '',
                }, {
                  id: 'HR',
                  title: 'HR/CFO',
                  name: 'Anne Jorunn Fjærestad',
                  color: '#007ad0',
                  image: 'https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2020/03/17131210/Highsoft_04045_.jpg'
                }, {
                  id: 'CTO',
                  title: 'CTO',
                  name: 'Christer Vasseng',
                  image: 'https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2020/03/17131120/Highsoft_04074_.jpg'
                }, {
                  id: 'CPO',
                  title: 'CPO',
                  name: 'Torstein Hønsi',
                  image: 'https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2020/03/17131213/Highsoft_03998_.jpg'
                }, {
                  id: 'CSO',
                  title: 'CSO',
                  name: 'Anita Nesse',
                  image: 'https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2020/03/17131156/Highsoft_03834_.jpg'
                }, {
                  id: 'Product',
                  name: 'Product developers'
                }, {
                  id: 'Web',
                  name: 'Web devs, sys admin',
                  description: 'Lorem ipsum<br>lorem ipsum<br>lorem ipsum',
                }, {
                  id: 'Sales',
                  name: 'Sales team'
                }, {
                  id: 'Market',
                  name: 'Marketing team',
                  column: 5
                }],
                colorByPoint: false,
                color: '#007ad0',
                linkColor: "#ccc",
                linkLineWidth: 2,
                dataLabels: {
                  color: 'white'
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


            
        });

        const fetchOrg = async (oe) => {
            try {
       
              let protocol_host =
                location.protocol + "//" +
                location.hostname + ":" +
                location.port;                 

              const url = `${protocol_host}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getOrgStructure?oe=${oe}`;
        
              const res = await fetch(url)
              let response = await res.json()              
              console.log(response.retval);	  
              return response.retval;
            } catch (error) {
              console.log(error)              
            }	
        }

        Vue.watch(oe, (currentVal, oldVal) => {            
            fetchOrg(currentVal);         
        });
      

        Vue.onMounted(() => {
            console.log('OrgViewer organisation mounted');
        })

        return { chartOptions }
    },
    template: `
    
        OrgViewer ({{ oe }})
        <figure style="width:100%">
            <highcharts class="chart" :options="chartOptions"></highcharts>
        </figure>
    `
}