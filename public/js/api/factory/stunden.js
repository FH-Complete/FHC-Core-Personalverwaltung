export default {
  getTeilzeittypen() {
    return {
      method: 'post',
      url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/CommonsAPI/getTeilzeittypen',
    }
  }  
};
