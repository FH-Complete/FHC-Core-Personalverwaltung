const TopLevel = {
	name: 'TopLevel',
    components: {
        Modal,
        ModalDialog,
        Toast,        
    },
    props: {
       
    },
    setup( props ) {

        const chartOptions = Vue.reactive({            
              chart: {
                type: 'spline'
              },
              title: {
                text: 'Sin chart'
              },
              series: [{
                data: [10, 0, 8, 2, 6, 4, 5, 5],
                color: '#6fcd98'
              }]
            
          });

        /*
        const seriesData = Vue.ref([25, 39, 30, 15, 20]);
        const categories = Vue.ref(['Jun', 'Jul', 'Aug', 'Sept']);

        const chartOptions = Vue.computed(() => ({
            chart: {
                type: 'line',
            },
            title: {
                text: 'Number of project stars',
            },
            xAxis: {
                categories: categories.value,
            },
            yAxis: {
                title: {
                    text: 'Number of stars',
                },
            },
            series: [{
                name: 'New project stars',
                data: seriesData.value,
            }],
        }));*/

        Vue.onMounted(() => {
            console.log('TopLevel organisation mounted');
        })

        return { chartOptions }
    },
    template: `
    <div class="row">
        TopLevel Component
        <highcharts class="chart" :options="chartOptions"></highcharts>
    </div>
    `
}