const BirthdayCountCard = {
     props: {
     },
     setup( ) {
        
        const birthdayData = Vue.ref();
        const currentDate = Vue.ref(new Date());
        const currentMonth = Vue.ref(currentDate.value.getMonth()+1);
        const currentYear = Vue.ref(currentDate.value.getFullYear());
        const isFetching = Vue.ref(false);

        const formatDate = (ds) => {
            var d = new Date(ds);
            return d.getDate()  + "." + (d.getMonth()+1) + "." + d.getFullYear()
        }

        const fetchBirthdays = async () => {
			try {
				let full = location.protocol +	"//" +
					location.hostname +	":" + location.port; 
              
              let ts = Math.round(currentDate.value.getTime() / 1000);  // unix timestamp
			  const url = `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getBirthdays?date=${ts}`;
              isFetching.value = true;
			  const res = await fetch(url)
			  let response = await res.json();
              isFetching.value = false;              
			  console.log(response.retval);	  
			  birthdayData.value = response.retval;			  
			} catch (error) {
			  console.log(error);
              isFetching.value = false;           
			}		
		}

        Vue.onMounted(() => {
            fetchBirthdays();
        })
      
        return {
            birthdayData, currentYear, currentMonth, isFetching, formatDate,currentDate,
        }
     },
     template: `
     <div class="card">
        <div class="card-header">
            <h5 class="mb-0">Geburtstage</h5>
                {{formatDate(currentDate)}}
            </div>
            <div class="card-body" style="text-align:center">
            <div v-if="isFetching" class="spinner-border" role="status">
                 <span class="visually-hidden">Loading...</span>
            </div>            
            <h3 v-if="!isFetching">{{ birthdayData?.length }}</h3>
        </div>
     </div>
     
     `
   

}