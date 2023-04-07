export default {
  getCurrentAndFutureVBs: function(typ, options) {
    var url = FHC_JS_DATA_STORAGE_OBJECT.app_root + 'index.ci.php/extensions/FHC-Core-Personalverwaltung/Api/getCurrentAndFutureVBs/' + typ;
      if( typeof options !== 'undefined' ) {
        const params = new URLSearchParams(options);
        url = url + '?' + params.toString();
      }
      return axios.get(url);
  }
};
