export default {
  filterPerson: function(searchVal) {
    var url =  '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/filterPerson';
    return this.$fhcApi.post(url, searchVal, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  createEmployee: function(employeeData) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/createEmployee';
    return this.$fhcApi.post(url, employeeData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  personAbteilung: function(uid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personAbteilung';
    return this.$fhcApi.get(url, { uid: uid });
  },
  personHeaderData: function(personID, uid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/headerData';
    return this.$fhcApi.get(url, { person_id: personID, uid: uid });
  },
  dvByPerson: function(uid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/dvByPerson';
    return this.$fhcApi.get(url, {  uid: uid });
  },
  getCurrentDV: function(uid, ts) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getCurrentDV';
    return this.$fhcApi.get(url, { uid: uid, d: ts });
  },
  deleteDV: function(dv_id) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/deleteDV';
    return this.$fhcApi.post(url, { dv_id: dv_id  });
  },
  uploadPersonEmployeeFoto: function(person_id, imagedata) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/uploadPersonEmployeeFoto';
    return this.$fhcApi.post(url, {person_id: person_id,imagedata: imagedata}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  deletePersonEmployeeFoto: function(person_id) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonEmployeeFoto';
    return this.$fhcApi.post(url, {person_id: person_id}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  getEmployeesWithoutContract: function() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getEmployeesWithoutContract';
    return this.$fhcApi.get(url);
  },
  dvInfoByPerson: function(uid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/dvInfoByPerson';
    return this.$fhcApi.get(url, { uid: uid });
  },
};
