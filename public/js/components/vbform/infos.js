export default {
  name: 'Infos',
  template: `
  <div v-if="infos.length > 0" class="row g-2">
    <div v-if="padleft" class="col-1">&nbsp;</div>
    <div :class="getColumnClass">
        <div class="alert py-1 alert-info" v-for="(error, idx) in infos" :key="idx">{{ error }}</div>
    </div>
    <div v-if="padright" class="col-1">&nbsp;</div>
  </div>
  `,
  props: {
    infos:{
        type: Array,
        default: []
    },
    padleft: {
        type: Boolean,
        default: false
    },
    padright: {
        type: Boolean,
        default: false
    }
  },
  computed: {
      getColumnClass: function() {
          var colwidth = 12;
          if( this.padleft ) {
              colwidth--;
          }
          if( this.padright ) {
              colwidth--;
          }
          return 'col-' + colwidth;
      }
  }
}
