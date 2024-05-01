import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const LehreCard = {
     props: {
        uid: String,
        date: Date,
     },
     setup( props ) {
        
        const courseData = Vue.ref();
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Lehre/Betreuung");
        const currentDate = Vue.ref(null);
        const currentUID = Vue.toRefs(props).uid  

        const formatDate = (ds) => {
            if (ds == null) return '';
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const calcSemester = () => {
            
            let d = new Date();
            if (currentDate.value != null) {
                d = new Date(currentDate.value);
            }

            let y=d.getFullYear(); 
            let semesterString = "SS";

            if (d.getMonth() < 8 && d.getMonth() > 1) return semesterString + y;
            else if (d.getMonth() < 2) {
                y--; 
            }

            semesterString = "WS";
            return semesterString + y;
            
        }

        const currentSemester = Vue.ref(calcSemester())   

        const decSemester = () => {
            if (currentSemester.value.startsWith('WS')) {
                currentSemester.value = 'SS' + currentSemester.value.substring(2)
            } else {
                currentSemester.value = 'WS'+ (parseInt(currentSemester.value.substring(2)) - 1)
            }
        }

        const incSemester = () => {
            if (currentSemester.value.startsWith('WS')) {
                currentSemester.value = 'SS' + (parseInt(currentSemester.value.substring(2)) + 1)
            } else {
                currentSemester.value = 'WS'+ currentSemester.value.substring(2)
            }
        }

        const chartOptions = Vue.reactive({
            lang: {
                thousandsSep: '.'
            },
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
            series: [{
                    name: 'Lehre',
                    data: [],
                    color: '#6fcd98',
                    step: 'left' // or 'center' or 'right'
                },
                {
                    name: 'Betreuung',
                    data: [],
                    color: '#cd6fca',
                    step: 'left' // or 'center' or 'right'
                }, 
            ],
            xAxis: {
                type: 'category',                
                labels: {                  
                  rotation: 90
                },
                /*tickPositioner: function() {
                  return dates.value.map(function(date) {
                    return Date.parse(date);
                  });
                }*/
            },
            tooltip: {
                pointFormat: '<b>{point.y:,.2f}</b>',
                
            },
            yAxis: {
                //min: 0,
                title: {
                    text: 'Semesterstunden'
                }
            },
            credits: {
                enabled: false
              },
                      
        })

        // fetch chart data
        const fetchAllCourseHours = async (dv_id, date) => {
            isFetching.value = true
            try {
                const res = await Vue.$fhcapi.Gehaltsbestandteil.gbtChartDataByDV(dv_id);
                gbtChartData.value = res.data;
                let tempData1 = [], tempData2 = [];
                // chartOptions.series[0].data.length = 0;
                Object.keys(res.data.gesamt).forEach(element => {
                   tempData1.push([new Date(element).getTime(), parseFloat(res.data.gesamt[element])]);
                });
                res.data.abgerechnet.forEach(element => {
                    tempData2.push([new Date(element.datum).getTime(), parseFloat(element.sum)]);
                });
                chartOptions.series[0].data = tempData1;
                chartOptions.series[1].data = tempData2;
            } catch (error) {
                console.log(error)                
            } finally {
                isFetching.value = false
            }
           
        }
        
        const fetchCourseHours = async () => {
            if (currentUID.value == null || currentDate.value == null) {
                return;
            }
			try {
			  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;                
			  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getAllCourseHours?uid=${currentUID.value}`;
              isFetching.value = true;
			  const res = await fetch(url)
			  let response = await res.json();
              isFetching.value = false;         
              let tempData1 = [], tempData2 = [];     
			  console.log(response.retval);	  
              response.retval.forEach(element => {
                tempData1.push([element.studiensemester_kurzbz, element.semesterstunden]);
            });
                chartOptions.series[0].data = tempData1;			  			  
			} catch (error) {
			  console.log(error);
              isFetching.value = false;           
			}		
		}

        const fetchSupportHours = async () => {
            if (currentUID.value == null || currentDate.value == null) {
                return;
            }
			try {
			  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;                
			  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getAllSupportHours?uid=${currentUID.value}`;
              isFetching.value = true;
			  const res = await fetch(url)
			  let response = await res.json();
              isFetching.value = false;         
              let tempData1 = [], tempData2 = [];     
			  console.log(response.retval);	  
              response.retval.forEach(element => {
                tempData1.push([element.studiensemester_kurzbz, element.semesterstunden]);
            });
                chartOptions.series[1].data = tempData1;
			  			  
			} catch (error) {
			  console.log(error);
              isFetching.value = false;           
			}		
		}

        Vue.onMounted(() => {
            currentDate.value = props.date || new Date();
            fetchCourseHours();
        })

        Vue.watch(
			currentUID,
			() => {
				fetchCourseHours();
                fetchSupportHours();
			}
		)

        Vue.watch(
            currentSemester,
            () => {
                fetchCourseHours();
                fetchSupportHours();
            }
        )
      
        return {
            courseData, isFetching, formatDate, currentSemester, title, currentUID, currentDate, incSemester, decSemester, chartOptions,
        }
     },
     template: `
     <div class="card">
        <div class="card-header d-flex align-items-baseline">
            <h5 class="mb-0 flex-grow-1">{{ title }}</h5>               
        </div>
        <div class="card-body" style="text-align:center">
                <div style="width:100%;height:100%;overflow:auto">
                    <figure>
                        <highcharts class="chart" :options="chartOptions"></highcharts>
                    </figure>
                </div>
        </div><!-- card-body -->
     </div>
     
     `
   

}