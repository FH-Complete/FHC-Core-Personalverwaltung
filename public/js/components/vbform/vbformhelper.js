import { computed } from 'vue';
import presetable from '../../mixins/vbform/presetable.js';
import tabs from './tabs.js';
import vblistgroup from './vblistgroup.js';
import vertragsbestandteillist from './vertragsbestandteillist.js';
import dv from './dv.js';
import store from './vbsharedstate.js';
import errors from './errors.js';
import infos from './infos.js';
import tabsspacer from './tabsspacer.js';
import vblistgroupspacer from './vblistgroupspacer.js';

export default {
  template: `
    <div class="vbformhelper flex-shrink-1 flex-grow-1 d-flex flex-column overflow-hidden">
      <div class="py-1 mb-1">
        <infos v-show="store.showmsgs" :infos="(preset?.guioptions?.infos !== undefined) ? preset?.guioptions?.infos : []" :padright="false"></infos>
        <errors v-show="store.showmsgs" :errors="(preset?.guioptions?.errors !== undefined) ? preset?.guioptions?.errors : []" :padright="false"></errors>
      </div>
      <component ref="parts" v-for="(child, idx) in children" :key="idx" :is="child.type" :preset="child"></component>
    </div>
  `,
  inject: [
    'fhcapi'
  ],
  components: {
    "tabs": tabs,
    "vblistgroup": vblistgroup, 
    "dv": dv,
    "vertragsbestandteillist": vertragsbestandteillist,
    "infos": infos,
    "errors": errors,
    "tabsspacer": tabsspacer,
    "vblistgroupspacer": vblistgroupspacer
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
        'freitexttypen': computed(() => this.lists.freitexttypen),
        'gehaltstypen': computed(() => this.lists.gehaltstypen)
    }  
  },
  emits: [
    "vbhjsonready"
  ],
  created: function() {
    this.getFreitexttypen();
    this.getGehaltstypen();
    this.setScrollBarWidthCSSVar();
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
      const response = await this.fhcapi.Freitext.getFreitexttypen();
      const freitexttypen = response.data.retval;
      freitexttypen.unshift({
        value: '',
        label: 'Freitexttyp wählen',
        disabled: true
      });
      this.lists.freitexttypen = freitexttypen;
    },
    getGehaltstypen: async function() {
      const response = await this.fhcapi.Gehaltsbestandteil.getGehaltstypen();
      const gehaltstypen = response.data.retval;
      gehaltstypen.unshift({
        value: '',
        label: 'Gehaltstyp wählen',
        disabled: true
      });
      this.lists.gehaltstypen = gehaltstypen;
    },
    setScrollBarWidthCSSVar: function() {
        const scrollDiv = document.createElement('div');
        scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
        document.body.appendChild(scrollDiv);
        const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    }
  }
}
