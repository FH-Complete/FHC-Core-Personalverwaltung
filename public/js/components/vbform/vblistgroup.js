import presetable from '../../mixins/vbform/presetable.js';
import vertragsbestandteillist from '../../components/vbform/vertragsbestandteillist.js';

export default {
  template: `
  <div class="row h-100 overflow-hidden">
    <div class="col-12 h-100">
      <div class="container-fluid p-0 pe-3 h-100 overflow-auto scrollbar-gutter-stable pt-2" :id="preset.guioptions.id">
        <component ref="parts" v-for="(child, idx) in children" :is="child.type" :key="idx" :preset="child"></component>
      </div>
    </div>
  </div>
  `,
  data: function() {
    return {
      payload: {
        type: 'vblistgroup',
        guioptions: {
          title: '',
          id: ''
        },
        children: []
      }
    };
  },
  components: {
    "vertragsbestandteillist": vertragsbestandteillist
  },
  mixins: [
    presetable
  ],
  methods: {
    getPayload: function() {
      var children = [];
      for( var i in this.$refs.parts ) {
        children.push(this.$refs.parts[i].getPayload());
      }
      var payload = {
        type: 'vblistgroup',
        guioptions: JSON.parse(JSON.stringify(this.preset.guioptions)),
        children: children
      };
      return payload;
    }
  }
}
