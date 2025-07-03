export default {

  allByPerson: function(uid, all) {
    let url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/getPersonFristenListe/' + uid 
            + '?all=' + all;
    return this.$fhcApi.get(url);
  },

  all: function() {
    let url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/getFristenListe';
    return this.$fhcApi.get(url);
  },

  updateFristenListe: function() {
    let url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/updateFristenListe';
    return this.$fhcApi.get(url);
  },

  updateFristStatus: function(frist_id, status_kurzbz) {
    let url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/updateFristStatus';
    return this.$fhcApi.post(url, {frist_id, status_kurzbz}, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  },

  batchUpdateFristStatus: function(fristen, status_kurzbz) {
    let url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/batchUpdateFristStatus';
    return this.$fhcApi.post(url, {fristen, status_kurzbz}, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  },
  
  upsertFrist: function(frist) {
    let url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/upsertFrist';
    return this.$fhcApi.post(url, frist, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  },

  deleteFrist: function(frist_id) {
    let url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/deleteFrist';
    return this.$fhcApi.post(url, {frist_id}, {
      headers: {
        'Content-Type': 'application/json'
      } 
    })  
  }, 

  getFristenStatus: function() {
    let url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/getFristenStatus';
    return this.$fhcApi.get(url);
  },

  getFristenEreignisse: function() {
    let url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/getFristenEreignisse';
    return this.$fhcApi.get(url);
  },

  getFristenEreignisseManuell: function() {
    let url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/FristenAPI/getFristenEreignisse?manuell=1';
    return this.$fhcApi.get(url);
  },

};
