export default {
  filterPerson: function(searchVal) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/PersonAPI/filterPerson';
    return axios.post(url, searchVal, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  createEmployee: function(employeeData) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/PersonAPI/createEmployee';
    return axios.post(url, employeeData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  personAbteilung: function(uid) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/PersonAPI/personAbteilung';
    return axios.get(url, { params: { uid: uid} });
  },
  personHeaderData: function(personID, uid) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/PersonAPI/headerData';
    return axios.get(url, { params: { person_id: personID, uid: uid  } });
  },
  dvByPerson: function(uid) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/DVAPI/dvByPerson';
    return axios.get(url, { params: { uid: uid  } });
  },
  getCurrentDV: function(uid, ts) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/DVAPI/getCurrentDV';
    return axios.get(url, { params: { uid: uid, d: ts  } });
  },
  deleteDV: function(dv_id) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/DVAPI/deleteDV';
    return axios.post(url, { dv_id: dv_id  });
  },
  uploadPersonEmployeeFoto: function(person_id, imagedata) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/PersonAPI/uploadPersonEmployeeFoto';
    return axios.post(url, {person_id: person_id,imagedata: imagedata}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  deletePersonEmployeeFoto: function(person_id) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/PersonAPI/deletePersonEmployeeFoto';
    return axios.post(url, {person_id: person_id}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  getEmployeesWithoutContract: function() {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/DVAPI/getEmployeesWithoutContract';
    return axios.get(url);
  },
  dvInfoByPerson: function(uid) {
    var url =  FHC_JS_DATA_STORAGE_OBJECT.app_root + FHC_JS_DATA_STORAGE_OBJECT.ci_router 
            + '/extensions/FHC-Core-Personalverwaltung/api/v1/DVAPI/dvInfoByPerson';
    return axios.get(url, { params: { uid: uid  } });
  },
};
