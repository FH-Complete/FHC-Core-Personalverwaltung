export default {
  filterPerson: function(searchVal) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/filterPerson';
    return axios.post(url, searchVal, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  createEmployee: function(employeeData) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/createEmployee';
    return axios.post(url, employeeData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  personAbteilung: function(uid) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/personAbteilung';
    return axios.get(url, { params: { uid: uid} });
  },
  personHeaderData: function(personID, uid) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/personHeaderData';
    return axios.get(url, { params: { person_id: personID, uid: uid  } });
  },
  dvByPerson: function(uid) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/dvByPerson';
    return axios.get(url, { params: { uid: uid  } });
  },
  deleteDV: function(dv_id) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/deleteDV';
    return axios.get(url, { params: { dv_id: dv_id  } });
  },
  uploadPersonEmployeeFoto: function(person_id, imagedata) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/uploadPersonEmployeeFoto';
    return axios.post(url, {person_id: person_id,imagedata: imagedata}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  deletePersonEmployeeFoto: function(person_id) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router + '/extensions/FHC-Core-Personalverwaltung/api/deletePersonEmployeeFoto';
    return axios.post(url, {person_id: person_id}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }  
};