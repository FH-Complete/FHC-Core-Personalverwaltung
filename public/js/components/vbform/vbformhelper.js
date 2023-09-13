import presetable from '../../mixins/vbform/presetable.js';
import tabs from './tabs.js';
import vblistgroup from './vblistgroup.js';
import vertragsbestandteillist from './vertragsbestandteillist.js';
import dv from './dv.js';
import store from './vbsharedstate.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  template: `
    <div class="vbformhelper">
      <div class="border-bottom py-2 mb-3">
        <infos :infos="(preset?.guioptions?.infos !== undefined) ? preset?.guioptions?.infos : []" :padright="false"></infos>
        <errors :errors="(preset?.guioptions?.errors !== undefined) ? preset?.guioptions?.errors : []" :padright="false"></errors>
      </div>
      <component ref="parts" v-for="(child, idx) in children" :key="idx" :is="child.type" :preset="child"></component>
    </div>
  `,
  components: {
    "tabs": tabs,
    "vblistgroup": vblistgroup, 
    "dv": dv,
    "vertragsbestandteillist": vertragsbestandteillist,
    "infos": infos,
    "errors": errors
  },
  mixins: [
    presetable
  ],
  data: function() {
    return {
      store: store
    };
  },
  emits: [
    "vbhjsonready"
  ],
  methods: {
    getPayload: function() {
      var children = [];
      for ( var i in this.$refs.parts) {
        children.push(this.$refs.parts[i].getPayload());
      }
      var payload = {
        "type": "formdata",
        "guioptions": JSON.parse(JSON.stringify(this.preset.guioptions)),
        "children": children,
        "dv": this.store.getDVPayload(),
        "vbs": this.store.getVBsPayload()
      };
      return payload;
    },
    getJSON: function() {
      var payload = this.getPayload();
      this.$emit('vbhjsonready', JSON.stringify(payload, null, 2));
    }
  }
}
