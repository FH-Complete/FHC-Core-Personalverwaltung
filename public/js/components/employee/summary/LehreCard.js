import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const LehreCard = {
     props: {
        uid: String,
     },
     setup( props ) {
        
        const courseData = Vue.ref();
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Lehre");
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
            fetchCurrentDV();
        })

        Vue.watch(
			currentUID,
			() => {
				fetchCurrentDV();
			}
		)
      
        return {
            courseData, isFetching, formatDate, currentSemester, title, currentUID
        }
     },
     template: `
     <div class="card">
        <div class="card-header">
            <h5 class="mb-0">{{ title }}</h5>
                {{ currentSemester }}
            </div>
            <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                 <span class="visually-hidden">Loading...</span>
            </div>     
            <div v-if="!isFetching && courseData!=null">
                {{ courseData.semesterstunden.toLocaleString("de-DE", { useGrouping: true, } ) }} Std/Sem
            </div>
            
            
        </div>
     </div>
     
     `
   

}