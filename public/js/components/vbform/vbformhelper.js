import presetable from '../../mixins/vbform/presetable.js';
import tabs from './tabs.js';
import vertragsbestandteillist from './vertragsbestandteillist.js';
import dv from './dv.js';
import store from './vbsharedstate.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  template: `
    <div class="vbformhelper">
      <div class="border-bottom py-2 mb-3">        
        <div class="row g-2 py-2">
          <div class="col-9">&nbsp;</div>
        
          <div class="col-3">
            <div class="btn-toolbar" role="toolbar" aria-label="TmpStore Toolbar">
                <div class="btn-group me-2" role="group" aria-label="First group">
                    <button class="btn btn-danger btn-sm float-end" @click="save">{{ getSaveButtonLabel }}</button>
                </div>
                <div class="btn-group me-2" role="group" aria-label="Second group">
                    <button class="btn btn-secondary btn-sm float-end" @click="validate">Eingaben prüfen</button>
                </div>
            </div>
          </div>
        </div>
        <infos :infos="(preset?.guioptions?.infos !== undefined) ? preset?.guioptions?.infos : []" :padright="false"></infos>
        <errors :errors="(preset?.guioptions?.errors !== undefined) ? preset?.guioptions?.errors : []" :padright="false"></errors>
      </div>
      <component ref="parts" v-for="(child, idx) in children" :key="idx" :is="child.type" :preset="child"></component>
    </div>
  `,
  components: {
    "tabs": tabs,
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
    "vbhjsonready",
    "saved"
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
    },
    save: function() {
      const payload = this.getPayload();
      this.$emit('vbhjsonready', JSON.stringify(payload, null, 2));
      
      const that = this;
      Vue.$fhcapi.Vertrag.saveForm(this.store.mitarbeiter_uid, payload)
      .then((response) => {
        that.$emit('saved', response.data.data);
      });
    },
    validate: function() {
      const payload = this.getPayload();
      this.$emit('vbhjsonready', JSON.stringify(payload, null, 2));
      
      const that = this;
      Vue.$fhcapi.Vertrag.saveForm(this.store.mitarbeiter_uid, payload, 'dryrun')
      .then((response) => {
        that.$emit('saved', response.data.data);
      });
    }
  },
  computed: {
      getSaveButtonLabel: function() {
          if( this.store.mode === 'aenderung' ) {
              return 'Änderung speichern';
          } else {
              return 'Dienstverhältnis anlegen';
          }
      }
  }
}
