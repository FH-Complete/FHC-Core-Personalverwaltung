import presetable from '../../mixins/vbform/presetable.js';
import tabs from './tabs.js';
import vblistgroup from './vblistgroup.js';
import vertragsbestandteillist from './vertragsbestandteillist.js';
import dv from './dv.js';
import store from './vbsharedstate.js';
import errors from './errors.js';
import infos from './infos.js';
import tabsspacer from './tabsspacer.js';

export default {
  template: `
    <div class="vbformhelper flex-shrink-1 flex-grow-1 d-flex flex-column overflow-hidden">
      <div class="py-1 mb-1">
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
    "errors": errors,
    "tabsspacer": tabsspacer
  },
  mixins: [
    presetable
  ],
  data: function() {
    return {
      store: store,
      lists: {
          freitexttypen: [],
          gehaltstypen: []
      }
    };
  },
  provide: function() {
    return {
        'freitexttypen': Vue.computed(() => this.lists.freitexttypen),
        'gehaltstypen': Vue.computed(() => this.lists.gehaltstypen)
    }  
  },
  emits: [
    "vbhjsonready"
  ],
  created: function() {
    this.getFreitexttypen();
    this.getGehaltstypen();  
  },
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
    },
    getFreitexttypen: async function() {
      const response = await Vue.$fhcapi.Freitext.getFreitexttypen();
      const freitexttypen = response.data.retval;
      freitexttypen.unshift({
        value: '',
        label: 'Freitexttyp wählen',
        disabled: true
      });
      this.lists.freitexttypen = freitexttypen;
    },
    getGehaltstypen: async function() {
      const response = await Vue.$fhcapi.Gehaltsbestandteil.getGehaltstypen();
      const gehaltstypen = response.data.retval;
      gehaltstypen.unshift({
        value: '',
        label: 'Gehaltstyp wählen',
        disabled: true
      });
      this.lists.gehaltstypen = gehaltstypen;
    }
  }
}
