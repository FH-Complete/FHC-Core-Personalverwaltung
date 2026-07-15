export default {
  getKarenztypen() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getKarenztypen',
    }
  },
  saveKarenz(payload) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/KarenzAPI/saveKarenz',
      params: payload
    }
  }  
};
