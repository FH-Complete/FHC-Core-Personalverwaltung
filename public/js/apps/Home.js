
const pvApp = Vue.createApp(	{
	components: {
		EmployeeChooser,
		Sidebar,	
		ContractExpiring,	
	},
	setup() {

		const contractDataExpiring = Vue.ref([]);

		const fetchContracts = async () => {
			try {
				let full = location.protocol +	"//" +
					location.hostname +	":" + location.port; 
			  const url = `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getContractExpireIn30Days`;
		
			  const res = await fetch(url)
			  let response = await res.json()              
			  console.log(response.retval);	  
			  contractDataExpiring.value = response.retval;			  
			} catch (error) {
			  console.log(error)              
			}		
		}

		Vue.onMounted(() => {
			fetchContracts();
		})

		return {
			contractDataExpiring
		}
	}
}).mount('#wrapper');
