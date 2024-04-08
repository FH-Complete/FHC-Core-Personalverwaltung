import { ref, toRefs, watch, onMounted } from 'vue';
import {CoreRESTClient} from '../../../../../../js/RESTClient.js';

export const LehreCard = {
     props: {
        uid: String,
        date: Date,
     },
     setup( props ) {
        
        const courseData = ref();
        const isFetching = ref(false);
        const title = ref("Lehre");
        const currentDate = ref(null);
        const currentUID = toRefs(props).uid  

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

        const currentSemester = ref(calcSemester())   

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
        
        const fetchCourseHours = async () => {
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

        onMounted(() => {
            currentDate.value = props.date || new Date();
            fetchCourseHours();
        })

        watch(
			currentUID,
			() => {
				fetchCourseHours();
			}
		)

        watch(
            currentSemester,
            () => {
                fetchCourseHours();
            }
        )
      
        return {
            courseData, isFetching, formatDate, currentSemester, title, currentUID, currentDate, incSemester, decSemester,
        }
     },
     template: `
     <div class="card">
        <div class="card-header d-flex align-items-baseline">
                <h5 class="mb-0 flex-grow-1">{{ title }}</h5>
                <div>
                <button type="button" class="btn btn-sm btn-primary me-2" @click="decSemester()"><i class="fa fa-minus"></i></button>
                <span class="text-muted">{{ currentSemester }}</span>
                <button type="button" class="btn btn-sm btn-primary ms-2" @click="incSemester()"><i class="fa fa-plus"></i></button>
                </div>
            </div>
            <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                 <span class="visually-hidden">Loading...</span>
            </div>     
            <div v-if="!isFetching && courseData!=null">
                {{ courseData.semesterstunden?.toLocaleString("de-DE", { useGrouping: true, } ) }} 
                <span v-if="courseData.semesterstunden !== null && courseData.semesterstunden >= 0">Std/Sem</span>
                <span v-else>-</span>
            </div>
            
            
        </div>
     </div>
     
     `
   

}