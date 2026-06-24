export default {
  getVerwendungsgruppen(oe_kurzbz) {
    return {
      method: 'get',
      url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVerwendungsgruppen?oe_kurzbz=${oe_kurzbz}`,
    }
  },
  getVerwendungsgruppenjahre(verwendungsgruppe_kurzbz = null) {
    const query = verwendungsgruppe_kurzbz
      ? `?verwendungsgruppe_kurzbz=${verwendungsgruppe_kurzbz}`
      : '';

    return {
        method: 'get',
        url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getVerwendungsgruppenjahre${query}`,
    }
  },
  getKollektivvertrag(oe_kurzbz) {
    return {
      method: 'get',
      url: `/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getKollektivvertrag?oe_kurzbz=${oe_kurzbz}`,
    }
  }

};
