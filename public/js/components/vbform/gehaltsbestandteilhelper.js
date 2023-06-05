import gehaltsbestandteil from './gehaltsbestandteil.js';
import presetable from '../../mixins/vbform/presetable.js';
import uuid from '../../helpers/vbform/uuid.js';

export default {
  template: `
  <gehaltsbestandteil ref="parts" v-for="config in children"
    v-bind:config="config" :key="config.guioptions.id" @removeGB="removeGB"></gehaltsbestandteil>
  <div class="row py-2 pb-1">
    <div class="col-12 ps-5">
      <div class="position-relative">
        <a class="btn btn-sm btn-light fs-6 fw-light stretched-link" href="javascript:void(0);" @click="addGB"><i class="fas fa-plus"></i></a>
        &nbsp;<em>Gehaltsbestandteil</em>
      </div>
    </div>
  </div>
  `,
  data: function() {
    return {
      payload: []
    };
  },
  components: {
    'gehaltsbestandteil': gehaltsbestandteil,
  },
  mixins: [
    presetable
  ],
  methods: {
    addGB: function(e) {
      e.preventDefault();
      e.stopPropagation();

      this.children.push({
        type: 'gehaltsbestandteil',
        guioptions: {
          id: uuid.get_uuid(),
          removeable: true
        }
      });
    },
    removeGB: function(payload) {
      var children = this.children.filter(function(gb) {
        return gb.guioptions.id !== payload.id;
      });
      this.children = children;
    },
    getPayload: function() {
      var payload = [];

      for( var i in this.$refs.parts ) {
        payload.push(this.$refs.parts[i].getPayload());
      }

      return payload;
    },
    markGBsEnded: function() {
      for( var i in this.$refs.parts ) {
        this.$refs.parts[i].markGBEnded();
      } 
    },
    setGBsDelete: function(hastobedeleted) {
      for( var i in this.$refs.parts ) {
        this.$refs.parts[i].setDelete(hastobedeleted);
      }
    }
  }
}
