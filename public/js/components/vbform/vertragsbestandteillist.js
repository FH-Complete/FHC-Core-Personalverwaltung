import vertragsbestandteilstunden from './vertragsbestandteil_stunden.js';
import vertragsbestandteilzeitaufzeichnung from './vertragsbestandteil_zeitaufzeichnung.js';
import vertragsbestandteilfunktion from './vertragsbestandteil_funktion.js';
import vertragsbestandteilfreitext from './vertragsbestandteil_freitext.js';
import vertragsbestandteilkuendigungsfrist from './vertragsbestandteil_kuendigungsfrist.js';
import vertragsbestandteilurlaubsanspruch from './vertragsbestandteil_urlaubsanspruch.js';
import vertragsbestandteilkarenz from './vertragsbestandteil_karenz.js';
import presetable from '../../mixins/vbform/presetable.js';
import uuid from '../../helpers/vbform/uuid.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  name: 'VertragsbestandteilList',
  template: `
      <div class="card card-body mb-3">
        <div class="row g-2 py-1">
          <div class="col">
            <div class="position-relative">
              <a class="btn btn-sm btn-primary mb-1" href="javascript:void(0);" @click="addVB"><i class="fas fa-plus"></i>
                &nbsp;
                {{ title }}{{ childcount }}
                &nbsp;
              </a>
            </div>
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
    'vertragsbestandteilurlaubsanspruch': vertragsbestandteilurlaubsanspruch,
    'vertragsbestandteilkarenz': vertragsbestandteilkarenz,
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
      if( this.preset.guioptions?.filter !== undefined ) {
          guioptions.filter = this.preset.guioptions.filter;
      }
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
      this.children.unshift(vbid);
    },
    removeVB: function(payload) {
      this.store.removeVB(payload.id);
      var children = this.children.filter(function(vbid) {
        return vbid !== payload.id;
      });
      this.children = children;
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
        var vb = that.store.getVB(uuid);
        if( vb !== null ) {
          vbs.push(vb);
        } else {
          delete this.children[i];
        }
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
