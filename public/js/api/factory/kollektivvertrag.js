export default {
  getVerwendungsgruppen(oe_kurzbz) {
    return {
      method: 'get',
      url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVerwendungsgruppen?oe_kurzbz=${oe_kurzbz}`,
    }
  },
  getVerwendungsgruppenjahre() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVerwendungsgruppenjahre',
    }
  },
  getKollektivvertrag(oe_kurzbz) {
    return {
      method: 'get',
      url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getKollektivvertrag?oe_kurzbz=${oe_kurzbz}`,
    }
  }

};
