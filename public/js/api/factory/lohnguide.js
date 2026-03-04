export default {
  getFachrichtungen() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getFachrichtungen',
    }
  },
  getModellstellen() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getModellstellen',
    }
  },


  
};
