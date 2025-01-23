import gehaltsbestandteil from './gehaltsbestandteil.js';
import presetable from '../../mixins/vbform/presetable.js';
import uuid from '../../helpers/vbform/uuid.js';

export default {
  inject: [
	  'hassalarypermission'
  ],
  template: `
  <template v-if="hassalarypermission">
  <div class="row pt-3 pb-1">
    <div class="col-12">
      <div class="position-relative">
        <a class="btn btn-sm btn-primary" href="javascript:void(0);" @click="addGB">
          <i class="fas fa-plus"></i>&nbsp;Gehaltsbestandteil{{ childcount }}
        </a>
      </div>
    </div>
  </div>
  <gehaltsbestandteil ref="parts" v-for="config in children"
    v-bind:config="config" :key="config.guioptions.id" @removeGB="removeGB"></gehaltsbestandteil>
  </template>
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

      this.children.unshift({
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
  },
  computed: {
    childcount: function() {
      return (this.children.length > 0) ? ' (' + this.children.length + ')' : '';
    }
  }
}
