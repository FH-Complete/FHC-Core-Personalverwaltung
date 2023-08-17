const IssuesCountCard = {
     props: {
        showNew: Boolean
     },
     setup( props ) {
        
        const contractDataNew = Vue.ref();
        const currentDate = Vue.ref(new Date());
        const currentMonth = Vue.ref(currentDate.value.getMonth()+1);
        const currentYear = Vue.ref(currentDate.value.getFullYear());
        const isFetching = Vue.ref(false);
        const title = Vue.ref("Issues");

        const formatDate = (ds) => {
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const capitalize = (s) => {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        
        const fetchContractsNew = async () => {
			try {
			  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;  
              
              let method = "getContractNew";
              if (!props.showNew) {
                method = "getContractExpire";
                title.value = "Issues";
              }
			  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/${method}?month=${currentMonth.value}&year=${currentYear.value}`;
              isFetching.value = true;
			  const res = await fetch(url)
			  let response = await res.json();
              isFetching.value = false;              
			  console.log(response.retval);	  
			  contractDataNew.value = response.retval;			  
			} catch (error) {
			  console.log(error);
              isFetching.value = false;           
			}		
		}

        Vue.onMounted(() => {
            fetchContractsNew();
        })
      
        return {
            contractDataNew, currentYear, currentMonth, isFetching, title,
        }
     },
     template: `
     <div class="card">
        <div class="card-header">
            <h5 class="mb-0">{{ title }}</h5>
                &nbsp;
            </div>
            <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                 <span class="visually-hidden">Loading...</span>
            </div>            
            <h3 v-if="!isFetching">{{ contractDataNew?.length }}</h3>
        </div>
     </div>
     
     `
   

}