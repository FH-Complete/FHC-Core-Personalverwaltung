export default {
  getUnternehmen() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/OrgAPI/getUnternehmen',
    }
  },
  getVertragsarten() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVertragsarten',
    }
  },
  getDVByID(dvid) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/dvByID/' + dvid,
    }
  },
  endDV(payload) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/endDV',
      params: payload
    }
  },
  deactivateDV(payload) {    
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/deactivateDV',
      params: payload
    }
  },
  getDvEndeGruende() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getDvEndeGruende',
    }
  }
};
