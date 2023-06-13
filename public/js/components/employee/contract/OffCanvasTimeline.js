import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const OffCanvasTimeline = {
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
        let offCanvasEle = Vue.ref(null);
        let thisOffCanvasObj;  

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
            thisOffCanvasObj = new bootstrap.Offcanvas(offCanvasEle.value);
        })

        const show = () => {
            thisOffCanvasObj.show();
        }
        function hide() {
            thisOffCanvasObj.hide();
        }
        function toggle() {
            thisOffCanvasObj.toggle();
        }
        Vue.defineExpose({ show, hide, toggle});

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
            courseData, isFetching, formatDate, currentSemester, title, currentUID, events, offCanvasEle, show, hide, toggle,
        }
     },
     template: `
     <div class="offcanvas offcanvas-end" 
        ref="offCanvasEle"
        tabindex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
        <div class="offcanvas-header">
            <h5 id="offcanvasRightLabel">Vertragshistorie</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
                <p-timeline :value="events">
                    <template #content="slotProps">
                        {{slotProps.item.status}} 
                    </template>
                    <template #opposite="slotProps">
                        <small class="p-text-secondary">{{slotProps.item.date}}</small>
                    </template>
                </p-timeline>
            
            
        </div>
     </div>
     
     `
   

}