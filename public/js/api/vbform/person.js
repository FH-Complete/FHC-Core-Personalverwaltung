export default {
    filterPerson: function(searchVal) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/filterPerson';
      return axios.post(url, searchVal, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },    

    personBaseData: function(person_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/personBaseData';
      return axios.get(url, { params: { person_id: person_id} });
    },
    updatePersonBaseData: function(payload) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/updatePersonBaseData';
        return axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },

    personEmployeeData: function(person_id) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/personEmployeeData';
        return axios.get(url, { params: { person_id: person_id} });
    },
    updatePersonEmployeeData: function(payload) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/updatePersonEmployeeData';
        return axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },
    personEmployeeKurzbzExists: function(uid, kurzbz) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/personEmployeeKurzbzExists';
      return axios.get(url, { params: { uid, kurzbz} });
    },

    deletePersonBankData: function(bankverbindung_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/deletePersonBankData';
      return axios.post(url, {bankverbindung_id: bankverbindung_id}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    upsertPersonBankData: function(payload) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/upsertPersonBankData';
        return axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },
    personBankData: function(person_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/personBankData';
      return axios.get(url, { params: { person_id: person_id} });
    },

    personAddressData: function(person_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/personAddressData';
      return axios.get(url, { params: { person_id: person_id} });
    },
    deletePersonAddressData: function(adresse_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/deletePersonAddressData';
      return axios.post(url, {adresse_id: adresse_id}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    upsertPersonAddressData: function(payload) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/upsertPersonAddressData';
        return axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },

    personContactData: function(person_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/personContactData';
      return axios.get(url, { params: { person_id: person_id} });
    },
    deletePersonContactData: function(kontakt_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/deletePersonContactData';
      return axios.post(url, {kontakt_id: kontakt_id}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    upsertPersonContactData: function(payload) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/upsertPersonContactData';
        return axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },



    uidByPerson: function(person_id, uid) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/uidByPerson';
        return axios.get(url, { params: { person_id: person_id, person_uid: uid} });
    },
    personMaterialExpenses: function(person_id, uid) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/personMaterialExpenses';
        return axios.get(url, { params: { person_id: person_id, person_uid: uid} });
    },
    deletePersonMaterialExpenses: function(sachaufwand_id) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/deletePersonMaterialExpenses';
        return axios.post(url, {sachaufwand_id: sachaufwand_id}, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      },
    upsertPersonMaterialExpenses: function(payload) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
                + '/extensions/FHC-Core-Personalverwaltung/api/upsertPersonMaterialExpenses';
        return axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },

    deletePersonJobFunction: function(benutzerfunktion_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/deletePersonJobFunction';
      return axios.post(url, {benutzerfunktion_id: benutzerfunktion_id}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    upsertPersonJobFunction: function(payload) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
              + '/extensions/FHC-Core-Personalverwaltung/api/upsertPersonJobFunction';
      return axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    updatePersonUnruly: function(payload) {
        const url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router
            + '/api/frontend/v1/checkperson/CheckPerson/updatePersonUnrulyStatus';
        return axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}