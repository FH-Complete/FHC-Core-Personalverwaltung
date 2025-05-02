export default {
  calculateValorisation(valorisierunginstanz_kurzbz) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/calculateValorisation',   
      params: { valorisierunginstanz_kurzbz }   
    }
  },
  doValorisation(valorisierunginstanz_kurzbz) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/doValorisation',   
      params: { valorisierunginstanz_kurzbz }   
    }
  },
  getValorisierungsInstanzen() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getValorisierungsInstanzen',   
    }
  },
  getGehaelter(gehaelter_stichtag, gehaelter_oe_kurzbz) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getGehaelter',   
      params: {'gehaelter_stichtag': gehaelter_stichtag, 'gehaelter_oe_kurzbz': gehaelter_oe_kurzbz},
    }
  },
  getValorisationInfo(valorisierunginstanz_kurzbz) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getValorisationInfo',   
      params: {'valorisierunginstanz_kurzbz': valorisierunginstanz_kurzbz},
    }
  },
  getAllUnternehmen() {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/Valorisierung/getAllUnternehmen',   
    }
  }
}
