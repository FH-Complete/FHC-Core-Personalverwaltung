import vertragsbestandteilstunden from './vertragsbestandteil_stunden.js';
import vertragsbestandteilzeitaufzeichnung from './vertragsbestandteil_zeitaufzeichnung.js';
import vertragsbestandteilfunktion from './vertragsbestandteil_funktion.js';
import vertragsbestandteilfreitext from './vertragsbestandteil_freitext.js';
import vertragsbestandteilkuendigungsfrist from './vertragsbestandteil_kuendigungsfrist.js';
import presetable from '../../mixins/vbform/presetable.js';
import uuid from '../../helpers/vbform/uuid.js';
import store from './vbsharedstate.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  template: `
      <div>
        <div class="row g-2 py-2 border-bottom mb-3">
          <div class="col">
            <a class="fs-6 fw-light" href="javascript:void(0);" @click="addVB"><i class="fas fa-plus-square"></i></a>
            &nbsp;
            <em>{{ title }}{{ childcount }}</em>
            &nbsp;
            <a class="fs-6 fw-light" v-if="(store.getMode() === 'aenderung')" href="javascript:void(0);" @click="fetchCurrentAndFutureVBs"><i class="fas fa-sync"></i></a>
          </div>
        </div>
        <infos :infos="(preset?.guioptions?.infos !== undefined) ? preset?.guioptions?.infos : []"></infos>
        <errors :errors="(preset?.guioptions?.errors !== undefined) ? preset?.guioptions?.errors : []"></errors>
        <component ref="parts" v-bind:is="config.type" v-for="config in getChildren()"
          v-bind:config="config" :key="config.guioptions.id" @removeVB="removeVB"></component>
      </div>
  `,
  props: [
    'data'
  ],
  data: function() {
    return {
      title: '',
      vertragsbestandteiltyp: '',
      store: store,
      payload: {
        type: 'vertragsbestandteillist',
        guioptions: {
          title: '',
          vertragsbestandteiltyp: '',
        },
        children: []
      }
    };
  },
  components: {
    'vertragsbestandteilstunden': vertragsbestandteilstunden,
    'vertragsbestandteilzeitaufzeichnung': vertragsbestandteilzeitaufzeichnung,
    'vertragsbestandteilfunktion': vertragsbestandteilfunktion,
    'vertragsbestandteilfreitext': vertragsbestandteilfreitext,
    'vertragsbestandteilkuendigungsfrist': vertragsbestandteilkuendigungsfrist,
    'infos': infos,
    'errors': errors
  },
  mixins: [
    presetable
  ],
  created: function() {
    this.title = this.preset.guioptions.title;
    this.vertragsbestandteiltyp = this.preset.guioptions.vertragsbestandteiltyp
  },
  methods: {
    addVB: function(e) {
      e.preventDefault();
      e.stopPropagation();

      if( this.vertragsbestandteiltyp === '') {
        return;
      }

      var vbid = uuid.get_uuid();
      var guioptions = (this.preset.guioptions?.childdefaults?.guioptions !== undefined)
                     ? JSON.parse(JSON.stringify(this.preset.guioptions.childdefaults.guioptions))
                     : {};
      guioptions.id = vbid;
      guioptions.removeable = true;
      var data = (this.preset.guioptions?.childdefaults?.data !== undefined)
                     ? JSON.parse(JSON.stringify(this.preset.guioptions.childdefaults.data))
                     : {};
      this.store.addVB(vbid, {
        type: this.vertragsbestandteiltyp,
        guioptions: guioptions,
        data: data
      });
      this.children.push(vbid);
    },
    removeVB: function(payload) {
      this.store.removeVB(payload.id);
      var children = this.children.filter(function(vbid) {
        return vbid !== payload.id;
      });
      this.children = children;
    },
    isAlreadyInChildren: function(vb) {
      for( var i in this.children ) {
        var tmpvb = this.store.getVB(this.children[i]);
        if( (tmpvb?.data?.id !== undefined) && (vb?.data?.id !== undefined) ) {
          return (tmpvb.data.id === vb.data.id)
        }
      }
      return false;
    },
    addFetchedVBs: function(vbs) {
      if( vbs.length === 0 ) {
        if( this.preset.guioptions?.infos === undefined ) {
          this.preset.guioptions.infos = [];
        }
        this.preset.guioptions.infos.push('Keine aktiven Vertragsbestandteile gefunden.');
      }
      var children = [];
      for(var i in vbs) {
        var vb = vbs[i];
        if( !this.isAlreadyInChildren(vb) ) {
          var vbid = uuid.get_uuid();
          vb.guioptions.id = vbid;
          this.store.addVB(vbid, vb);
          children.push(vbid);
        }
      }
      children = children.concat(this.children);
      this.children = JSON.parse(JSON.stringify(children));
    },
    fetchCurrentAndFutureVBs: function() {
      if( this.preset.guioptions?.infos !== undefined ) {
        this.preset.guioptions.infos = [];
      }
      const options = (this.preset.guioptions?.apioptions) ? this.preset.guioptions.apioptions : undefined;
      Vue.$fhcapi.Vertragsbestandteil.getCurrentAndFutureVBs(this.vertragsbestandteiltyp, options)
      .then((response) => {
        this.addFetchedVBs(response.data.data);
      });
    },
    getPayload: function() {
      this.payload = {
        type: 'vertragsbestandteillist',
        guioptions: JSON.parse(JSON.stringify(this.preset.guioptions)),
        children: JSON.parse(JSON.stringify(this.children))
      };
      this.updateVBsInStore();
      return this.payload;
    },
    updateVBsInStore: function() {
      for( var id in this.$refs.parts) {
        var payload = this.$refs.parts[id].getPayload();
        this.store.addVB(this.$refs.parts[id].config.guioptions.id, payload);
      }
    },
    getChildren: function() {
      var vbs = [];
      var that = this;

      for( var i in this.children ) {
        var uuid = this.children[i];
        vbs.push(that.store.getVB(uuid));
      }

      return vbs;
    }
  },
  computed: {
    childcount: function() {
      return (this.children.length > 0) ? ' (' + this.children.length + ')' : '';
    }
  }
}
