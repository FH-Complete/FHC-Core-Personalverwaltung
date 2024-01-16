import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const TimelineCard = {
     components: {
        "p-timeline": primevue.timeline,
     },
     props: {
        uid: String,
     },
     setup( props ) {
        
        const courseData = Vue.ref();
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Timeline");
        const currentUID = Vue.toRefs(props).uid        

        const formatDate = (ds) => {
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const currentSemester = Vue.computed(() => {
            const d = new Date();
            let y= d.getFullYear(); 
            let semesterString = "SS";

            if (d.getMonth < 8 && d.getMonth > 1) return semesterString + y;
            else if (d.getMonth < 2) {
                y--; 
            }

            semesterString = "WS";
            return semesterString + y;
            
        })

        
        const fetchCurrentDV = async () => {
            if (currentUID.value == null) {
                return;
            }
			try {
			  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;  
              
			  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getCourseHours?uid=${currentUID.value}&semester=${currentSemester.value}`;
              isFetching.value = true;
			  const res = await fetch(url)
			  let response = await res.json();
              isFetching.value = false;              
			  console.log(response.retval);	  
              if (response.retval.length>0) {
                courseData.value = response.retval[0];
              } else {
                courseData.value = null;
              }
			  			  
			} catch (error) {
			  console.log(error);
              isFetching.value = false;           
			}		
		}

        Vue.onMounted(() => {
          //  fetchCurrentDV();
        })

        Vue.watch(
			currentUID,
			() => {
				//fetchCurrentDV();
			}
		)

        // dummy events
        const events = [
            {status: 'Funktionsänderung', date: '1/2/2023', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg'},
            {status: 'Valorisierung (2,5%), Gehalt: € 3121,13', date: '1/9/2022', icon: 'pi pi-cog', color: '#673AB7'},
            {status: 'Valorisierung (1,5%), Gehalt: € 3150', date: '1/9/2021', icon: 'pi pi-shopping-cart', color: '#FF9800'},
            {status: 'Eintritt, Gehalt: € 3045', date: '16/10/2020', icon: 'pi pi-check', color: '#607D8B'}
        ]
      
        return {
            courseData, isFetching, formatDate, currentSemester, title, currentUID, events,
        }
     },
     template: `
     <div class="card">
        <div class="card-header">
            <h5 class="mb-0">{{ title }}</h5>
                echter DV
            </div>
            <div class="card-body" style="text-align:center">
                <p-timeline :value="events">
                    <template #content="slotProps">
                        {{slotProps.item.status}} <h4>Test</h4>
                    </template>
                    <template #opposite="slotProps">
                        <small class="p-text-secondary">{{slotProps.item.date}}</small>
                    </template>
                </p-timeline>
            
            
        </div>
     </div>
     
     `
   

}