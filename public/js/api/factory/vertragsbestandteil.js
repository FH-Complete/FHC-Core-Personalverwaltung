export default {
  getCurrentVBs(dvid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getCurrentVBs/' 
            + dvid;
    return {
      method: 'get',
      url,
    }
  },
  getCurrentAndFutureVBs(dvid, options) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getCurrentAndFutureVBs/' 
            + dvid;
      if( typeof options !== 'undefined' ) {
        const params = new URLSearchParams(options);
        url = url + '?' + params.toString();
      }
      return {
        method: 'get',
        url,
      }
  },
  getAllVBs(dvid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getAllVBs/' 
            + dvid;
    return {
      method: 'get',
      url,
    }
  },
  getVB(vbid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getVB/' 
            + vbid;
    return {
      method: 'get',
      url,
    }
  }
};
