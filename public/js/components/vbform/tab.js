import presetable from '../../mixins/vbform/presetable.js';
import vertragsbestandteillist from '../../components/vbform/vertragsbestandteillist.js';
import dv from './dv.js';

export default {
  name: 'Tab',
  template: `
  <div class="tab-pane h-100 overflow-hidden position-relative fade mt-2" :class="(activetab === preset.guioptions.id) ? 'active show' : ''"
       :id="'v-pills-' + preset.guioptions.id"
       role="tabpanel"
       :aria-labelledby="'v-pills-' + preset.guioptions.id + '-tab'"
       tabindex="0">
    <div class="container-fluid p-0 overflow-auto scrollbar-gutter-stable pe-3">
      <component ref="parts" v-for="(child, idx) in children" :is="child.type" :key="idx" :preset="child"></component>
    </div>
  </div>
  `,
  props: [
    'activetab'
  ],
  data: function() {
    return {
      payload: {
        type: 'tab',
        guioptions: {
          title: '',
          id: ''
        },
        children: []
      }
    };
  },
  components: {
    "dv": dv,
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
        type: 'tab',
        guioptions: JSON.parse(JSON.stringify(this.preset.guioptions)),
        children: children
      };
      return payload;
    }
  }
}
