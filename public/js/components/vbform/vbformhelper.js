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
          <div class="col-1">
            <button class="btn btn-primary btn-sm float-end" @click="saveToTmpStore">Zwischenspeichern</button>
          </div>
          <div class="col-1">
            <button class="btn btn-primary btn-sm float-end" @click="save">Speichern</button>
          </div>        
          <div class="col-1">
            <button class="btn btn-secondary btn-sm float-end" @click="getJSON">get JSON</button>
          </div>
        </div>
        <infos :infos="(preset?.guioptions?.infos !== undefined) ? preset?.guioptions?.infos : []"></infos>
        <errors :errors="(preset?.guioptions?.errors !== undefined) ? preset?.guioptions?.errors : []"></errors>
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
        "data": this.store.getDVPayload(),
        "vbs": this.store.getVBsPayload()
      };
      return payload;
    },
    getJSON: function() {
      var payload = this.getPayload();
      this.$emit('vbhjsonready', JSON.stringify(payload, null, 2));
    },
    saveToTmpStore: function() {
      const formdata = this.getPayload();
      this.$emit('vbhjsonready', JSON.stringify(formdata, null, 2));
      const payload = {
        tmpStoreId: 2,
        typ: this.store.getMode(),  
        mitarbeiter_uid: this.store.mitarbeiter_uid,  
        formdata: formdata
      };
      Vue.$fhcapi.TmpStore.storeToTmpStore(payload)
      .then((response) => {
        console.log('storeToTmpStore executed.');
      });
    },
    save: function() {
      const payload = this.getPayload();
      this.$emit('vbhjsonready', JSON.stringify(payload, null, 2));
      
      const that = this;
      Vue.$fhcapi.Vertrag.saveForm(this.store.mitarbeiter_uid, payload)
      .then((response) => {
        that.$emit('saved', response.data.data);
      });
    }
  }
}
