
const pvApp = Vue.createApp(	{
	components: {
		EmployeeChooser,
		Sidebar,
		EmployeeEditor,
		EmployeeTable,
		verticalsplit,
	},
	data() {
		return 	{
			tabledata: tableData,
			isEditorOpen: false,
			currentPersonID: null,	
		}
	},
	methods: {
		personSelectedHandler(id) {
			console.log('personSelected: ', id);
			this.isEditorOpen=true;
			this.currentPersonID = id;
		},
		closeEditorHandler() {
			this.isEditorOpen=false;
		},			
	},
});

const fetchNations = async () => {
	try {
		let full =
		(location.port == "3000" ? "https://" : location.protocol) +
		"//" +
		location.hostname +
		":" +
		(location.port == "3000" ? 8080 : location.port); // hack for dev mode
	  const url = `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getNations`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  console.log(response.retval);	  
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchSachaufwandTyp = async () => {
	try {
		let full =
		(location.port == "3000" ? "https://" : location.protocol) +
		"//" +
		location.hostname +
		":" +
		(location.port == "3000" ? 8080 : location.port); // hack for dev mode
	  const url = `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getSachaufwandTyp`;

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
		let full =
		(location.port == "3000" ? "https://" : location.protocol) +
		"//" +
		location.hostname +
		":" +
		(location.port == "3000" ? 8080 : location.port); // hack for dev mode
	  const url = `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getKontakttyp`;

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
		let full =
		(location.port == "3000" ? "https://" : location.protocol) +
		"//" +
		location.hostname +
		":" +
		(location.port == "3000" ? 8080 : location.port); // hack for dev mode
	  const url = `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getSprache`;

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
		let full =
		(location.port == "3000" ? "https://" : location.protocol) +
		"//" +
		location.hostname +
		":" +
		(location.port == "3000" ? 8080 : location.port); // hack for dev mode
	  const url = `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getAusbildung`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchStandorteIntern = async () => {
	try {
		let full =
		(location.port == "3000" ? "https://" : location.protocol) +
		"//" +
		location.hostname +
		":" +
		(location.port == "3000" ? 8080 : location.port); // hack for dev mode
	  const url = `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getStandorteIntern`;

	  const res = await fetch(url)
	  let response = await res.json()              
	  return response.retval;
	} catch (error) {
	  console.log(error)              
	}		
}

const fetchOrte = async () => {
	try {
		let full =
		(location.port == "3000" ? "https://" : location.protocol) +
		"//" +
		location.hostname +
		":" +
		(location.port == "3000" ? 8080 : location.port); // hack for dev mode
	  const url = `${full}/index.ci.php/extensions/FHC-Core-Personalverwaltung/api/getOrte`;

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

fetchSachaufwandTyp().then((r) => {
	pvApp.provide("sachaufwandtyp",r.retval);
})

pvApp.mount('#wrapper');


