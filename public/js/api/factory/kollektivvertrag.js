export default {
  getVerwendungsgruppen() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVerwendungsgruppen',
    }
  },
  getVerwendungsgruppenjahre() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVerwendungsgruppenjahre',
    }
  },

};
