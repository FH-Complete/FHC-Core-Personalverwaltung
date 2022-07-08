
const pvApp = Vue.createApp(	{
	components: {
		EmployeeChooser,
		Sidebar,
		PivotReport,
	},
	data() {
		return 	{
			isEditorOpen: false,
			currentPersonID: null,	
			currentOrg: '',
		}
	},
	methods: {		
		closeEditorHandler() {
			this.isEditorOpen=false;
		},			
	},
});

// 	pvApp.use(highchartsPlugin, {tagName: 'highcharts'});
pvApp.use(primevue.config.default);
pvApp.use(primevue.toastservice);

const fetchNations = async () => {
	try {
	  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
	  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getNations`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  console.log(response.retval);	  
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchKontakttyp = async () => {
	try {
	  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
	  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getKontakttyp`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  console.log(response.retval);	  
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchSprache = async () => {
	try {
	  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
	  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getSprache`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  console.log(response.retval);	  
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchAusbildung = async () => {
	try {
	  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
	  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getAusbildung`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchStandorteIntern = async () => {
	try {
	  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
	  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getStandorteIntern`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchOrte = async () => {
	try {
	  let full = FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
	  const url = `${full}/extensions/FHC-Core-Personalverwaltung/api/getOrte`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

fetchSprache().then((r) => {
	pvApp.provide("sprache",r.retval);
})

fetchNations().then((r) => {
	pvApp.provide("nations",r.retval);
})

fetchKontakttyp().then((r) => {
	pvApp.provide("kontakttyp",r.retval);
})

fetchAusbildung().then((r) => {
	pvApp.provide("ausbildung",r.retval);
})

fetchStandorteIntern().then((r) => {
	pvApp.provide("standorte",r.retval);
})

fetchOrte().then((r) => {
	pvApp.provide("orte",r.retval);
})

pvApp.mount('#wrapper');


