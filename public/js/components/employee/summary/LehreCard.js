import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const LehreCard = {
     props: {
        uid: String,
        date: Date,
     },
     setup( props ) {
        
        const courseData = Vue.ref();
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Lehre");
        const currentDate = Vue.ref(null);
        const currentUID = Vue.toRefs(props).uid        

        const formatDate = (ds) => {
            if (ds == null) return '';
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const currentSemester = Vue.computed(() => {
            
            let d = new Date();
            if (currentDate.value != null) {
                d = new Date(currentDate.value);
            }

            let y=d.getFullYear(); 
            let semesterString = "SS";

            if (d.getMonth < 8 && d.getMonth > 1) return semesterString + y;
            else if (d.getMonth < 2) {
                y--; 
            }

            semesterString = "WS";
            return semesterString + y;
            
        })

        
        const fetchCurrentDV = async () => {
            if (currentUID.value == null || currentDate.value == null) {
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
            currentDate.value = props.date || new Date();
            fetchCurrentDV();
        })

        Vue.watch(
			currentUID,
			() => {
				fetchCurrentDV();
			}
		)

        Vue.watch(
			[currentUID,() => props.date],
			newVal => {
                console.log('something changed: ', newVal)
				if (newVal[1] != null) {
                    currentDate.value = newVal[1];
                }
			}
		)
      
        return {
            courseData, isFetching, formatDate, currentSemester, title, currentUID, currentDate,
        }
     },
     template: `
     <div class="card">
        <div class="card-header">
            <h5 class="mb-0">{{ title }}</h5>
                {{ currentSemester }}  ({{ formatDate(currentDate) }})
            </div>
            <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                 <span class="visually-hidden">Loading...</span>
            </div>     
            <div v-if="!isFetching && courseData!=null">
                {{ courseData.semesterstunden?.toLocaleString("de-DE", { useGrouping: true, } ) }} Std/Sem
            </div>
            
            
        </div>
     </div>
     
     `
   

}