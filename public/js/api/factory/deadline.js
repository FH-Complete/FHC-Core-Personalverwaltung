export default {

  allByPerson(uid, all) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/getPersonFristenListe/' + uid 
            + '?all=' + all,
    }
  },

  all() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/getFristenListe',      
    }
  },

  updateFristenListe() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/updateFristenListe',
    }
  },

  updateFristStatus(frist_id, status_kurzbz) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/updateFristStatus',
      params: {frist_id, status_kurzbz}
    }
  },

  batchUpdateFristStatus(fristen, status_kurzbz) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/batchUpdateFristStatus',
      params: {fristen, status_kurzbz}
    }
  },
  
  upsertFrist(frist) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/upsertFrist',
      params: frist
    }
  },

  deleteFrist(frist_id) {    
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/deleteFrist',
      params: {frist_id}
    }
  }, 

  getFristenStatus() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/getFristenStatus',
    }
  },

  getFristenEreignisse() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/getFristenEreignisse',
    }
  },

  getFristenEreignisseManuell() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/getFristenEreignisse?manuell=1',
    }
  },

};
