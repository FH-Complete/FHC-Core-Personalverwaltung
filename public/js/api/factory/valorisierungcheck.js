export default {
  getDvData(dienstverhaeltnis_id) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/ValorisierungCheck/getDvData',
      params: { dienstverhaeltnis_id }
    }
  },
  getValorisierungCheckData(dienstverhaeltnis_id) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/ValorisierungCheck/getValorisierungCheckData',
      params: { dienstverhaeltnis_id }
    }
  },
  checkValorisationValidityOfDv(dienstverhaeltnis_id) {
    return {
      method: 'get',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/ValorisierungCheck/checkValorisationValidityOfDv',
      params: { dienstverhaeltnis_id }
    }
  },
  redoValorisation(dienstverhaeltnis_id) {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/ValorisierungCheck/redoValorisation',
      params: { dienstverhaeltnis_id }
    }
  }
}
