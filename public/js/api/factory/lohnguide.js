export default {
  getFachrichtungen() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getFachrichtungen',
    }
  },
  getModellstellen() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getModellstellen',
    }
  },
  getJobfamilien() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getJobfamilien',
    }
  },
  getModellfunktionen() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getModellfunktionen',
    }
  },

  getAll(orgID, stichtag, exportCSV) {
		let url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/LohnguideExport/getAll';

		return {
			method: 'get',
			url,
			params: { 
			  stichtag: stichtag, 
			  export: !!exportCSV, 
			  orgID: orgID,
			}
		}
	},
  
};
