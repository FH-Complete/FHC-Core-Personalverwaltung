export default {
    filterPerson: function(searchVal) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/filterPerson';
      return axios.post(url, searchVal, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },    

    personBaseData: function(person_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/personBaseData';
      return axios.get(url, { params: { person_id: person_id} });
    },
    updatePersonBaseData: function(payload) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/updatePersonBaseData';
        return axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },

    personEmployeeData: function(person_id) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/personEmployeeData';
        return axios.get(url, { params: { person_id: person_id} });
    },
    updatePersonEmployeeData: function(payload) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/updatePersonEmployeeData';
        return axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },

    deletePersonBankData: function(bankverbindung_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/deletePersonBankData';
      return axios.post(url, {bankverbindung_id: bankverbindung_id}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    upsertPersonBankData: function(payload) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/upsertPersonBankData';
        return axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },
    personBankData: function(person_id) {
      var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/personBankData';
      return axios.get(url, { params: { person_id: person_id} });
    },

    uidByPerson: function(person_id, uid) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/uidByPerson';
        return axios.get(url, { params: { person_id: person_id, person_uid: uid} });
    },
    personMaterialExpenses: function(person_id, uid) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/personMaterialExpenses';
        return axios.get(url, { params: { person_id: person_id, person_uid: uid} });
    },
    deletePersonMaterialExpenses: function(sachaufwand_id) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/deletePersonMaterialExpenses';
        return axios.post(url, {sachaufwand_id: sachaufwand_id}, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      },
    upsertPersonMaterialExpenses: function(payload) {
        var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/upsertPersonMaterialExpenses';
        return axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    },
}