export default {
  filterPerson(searchVal) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/filterPerson',
      params: searchVal
    }
  },
  createEmployee(employeeData) {   
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/createEmployee',
      params: employeeData
    }
  },
  personAbteilung(uid) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personAbteilung',
      params: { uid }
    }
  },
  personHeaderData(personID, uid) { 
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/headerData',
      params: { person_id: personID, uid: uid }
    }
  },
  dvByPerson(uid) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/dvByPerson',
      params: {  uid: uid }
    }
  },
  getCurrentDV(uid, ts) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getCurrentDV',
      params: { uid: uid, d: ts }
    }
  },
  deleteDV(dv_id) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/deleteDV',
      params: { dv_id: dv_id  }
    }
  },
  uploadPersonEmployeeFoto(person_id, imagedata) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/uploadPersonEmployeeFoto',
      params: {person_id: person_id,imagedata: imagedata}
    }
  },
  deletePersonEmployeeFoto(person_id) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonEmployeeFoto',
      params: {person_id}
    }
  },
  getEmployeesWithoutContract() {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getEmployeesWithoutContract',
    }
  },
  dvInfoByPerson(uid) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/dvInfoByPerson',
      params: {uid}
    }
  },
};
