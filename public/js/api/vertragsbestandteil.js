export default {
  getCurrentVBs: function(dvid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getCurrentVBs/' 
            + dvid;
      return this.$fhcApi.get(url);
  },
  getCurrentAndFutureVBs: function(dvid, options) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getCurrentAndFutureVBs/' 
            + dvid;
      if( typeof options !== 'undefined' ) {
        const params = new URLSearchParams(options);
        url = url + '?' + params.toString();
      }
      return this.$fhcApi.get(url);
  },
  getAllVBs: function(dvid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getAllVBs/' 
            + dvid;
      return this.$fhcApi.get(url);
  },
  getVB: function(vbid) {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/DVAPI/getVB/' 
            + vbid;
      return this.$fhcApi.get(url);
  }
};
