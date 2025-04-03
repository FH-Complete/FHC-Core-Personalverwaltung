export default {
  getTeilzeittypen: function() {
    var url = '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getTeilzeittypen';
    return this.$fhcApi.get(url);
  }  
};
