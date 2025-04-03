export default {
  name: 'Errors',
  template: `
  <div v-if="errors.length > 0" class="row g-2">
    <div v-if="padleft" class="col-1">&nbsp;</div>    
    <div :class="getColumnClass">
        <div class="alert py-1 alert-danger" v-for="(error, idx) in errors" :key="idx">{{ error }}</div>
    </div>
    <div v-if="padright" class="col-1">&nbsp;</div>
  </div>
  `,
  props: {
    errors:{
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
