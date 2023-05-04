import gehaltsbestandteilhelper from './gehaltsbestandteilhelper.js'
import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';
import store from './vbsharedstate.js';

export default {
  template: `
  <div class="py-2" :class="vbcssclasses">
    <infos :infos="(config?.guioptions?.infos !== undefined) ? config.guioptions.infos : []"></infos>
    <errors :errors="(config?.guioptions?.errors !== undefined) ? config.guioptions.errors : []"></errors>
    <div class="row g-2 py-2">
      <div class="col-2">
        <div class="form-check">
          <input v-model="mode" class="form-check-input form-check-input-sm" type="radio"
            @change="resetDropdowns"
            :name="'vbfunktionmode_' + config.guioptions.id" :id="'vbfunktionmode1_' + config.guioptions.id" value="neu">
          <label class="form-check-label" :for="'vbfunktionmode1_' + config.guioptions.id">Neue Funktion</label>
        </div>
      </div>
      <div class="col-3">
        <div class="form-check">
          <input v-model="mode" class="form-check-input form-check-input-sm" type="radio"
            @change="resetDropdowns"
            :name="'vbfunktionmode_' + config.guioptions.id" :id="'vbfunktionmode2_' + config.guioptions.id" value="bestehende">
          <label class="form-check-label" :for="'vbfunktionmode2_' + config.guioptions.id">bestehende Funktion</label>
        </div>
      </div>
      <div class="col-7">&nbsp;</div>
    </div>
    <div class="row g-2">
    <template v-if="mode === 'neu'">
      <div class="col">
        <select v-model="funktion" :disabled="isinputdisabled('funktion')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option
            v-for="f in lists.funktionen"
            :value="f.value"
            :selected="isselected(f.value, this.funktion)"
            :disabled="f.disabled">
            {{ f.label }}
          </option>
        </select>
      </div>
      <div class="col">
        <select v-model="orget" :disabled="isinputdisabled('orget')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option
            v-for="oe in lists.orgets"
            :value="oe.value"
            :selected="isselected(oe.value, this.orget)"
            :disabled="oe.disabled">
            {{ oe.label }}
          </option>
        </select>        
      </div>
    </template>
    <template v-else-if="mode === 'bestehende'">
      <div class="col">
        <select v-model="benutzerfunktionid" class="form-select form-select-sm">
          <option
            v-for="bf in lists.benutzerfunktionen"
            :value="bf.value"
            :selected="isselected(bf.value, this.benutzerfunktionid)"
            :disabled="bf.disabled">
            {{ bf.label }}
          </option>
        </select>
      </div>
    </template>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit"></gueltigkeit>
      <div class="col-1">
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>
      </div>
    </div>
    <gehaltsbestandteilhelper v-if="canhavegehaltsbestandteile" ref="gbh" v-bind:preset="getgehaltsbestandteile"></gehaltsbestandteilhelper>
  </div>
  `,
  components: {
    'gehaltsbestandteilhelper': gehaltsbestandteilhelper,
    'gueltigkeit': gueltigkeit,
    'infos': infos,
    'errors': errors
  },
  mixins: [
    configurable
  ],
  emits: {
    removeVB: null
  },
  data: function () {
    return {
      id: null,
      funktion: '',
      orget: '',
      benutzerfunktionid: '',
      mode: 'neu',
      lists: {
        funktionen: [],
        orgets: [],
        benutzerfunktionen: []
      },
      store: store
    };
  },
  created: function() {
    this.getFunktionen();
    this.getOrgetsForCompany();
    this.getCurrentFunctions();
    this.setDataFromConfig();
  },
  watch: {
      'store.unternehmen': function() {
        this.getOrgetsForCompany();
        this.getCurrentFunctions();
      },
      'store.mitarbeiter_uid': function() {
          this.getCurrentFunctions();
      }
  },
  methods: {
    isselected: function(optvalue, selvalue) {
      return (optvalue === selvalue);
    },
    resetDropdowns: function() {
      this.funktion = '';
      this.orget = '';
      this.benutzerfunktionid = '';
    },
    setDataFromConfig: function() {
      if( this.config?.data?.id !== undefined ) {
        this.id = this.config.data.id;
      }
      if( this.config?.data?.funktion !== undefined ) {
        this.funktion = this.config.data.funktion;
      }
      if( this.config?.data?.orget !== undefined ) {
        this.orget = this.config.data.orget;
      }
      if( this.config?.data?.benutzerfunktionid !== undefined ) {
        this.benutzerfunktionid = this.config.data.benutzerfunktionid;
      }
      if( this.config?.data?.mode !== undefined ) {
        this.mode = this.config.data.mode;
      }
    },
    getFunktionen: async function() {
      const response = await Vue.$fhcapi.Funktion.getContractFunctions();
      const funktionen = response.data.retval;
      funktionen.unshift({
        value: '',
        label: 'Funktion wählen',
        disabled: true
      });
      this.lists.funktionen = funktionen;
    },
    getOrgetsForCompany: async function() {
      if( this.store.unternehmen === '' ) {
          return;
      }
      const response = await Vue.$fhcapi.Funktion.getOrgetsForCompany(this.store.unternehmen);
      const orgets = response.data.retval;
      orgets.unshift({
        value: '',
        label: 'OrgEinheit wählen',
        disabled: true
      });
      this.lists.orgets = orgets;
    },
    getCurrentFunctions: async function() {
      if(this.store.unternehmen === '' || this.store.mitarbeiter_uid === '' ) {
        return;  
      }
      const response = await Vue.$fhcapi.Funktion.getCurrentFunctions(this.store.mitarbeiter_uid, this.store.unternehmen);
      const benutzerfunktionen = response.data.retval;
      benutzerfunktionen.unshift({
        value: '',
        label: 'Benutzerfunktion wählen',
        disabled: true
      });
      this.lists.benutzerfunktionen = benutzerfunktionen;
    },
    removeVB: function() {
      this.$emit('removeVB', {id: this.config.guioptions.id});
    },
    getGehaltsbestandteilePayload: function() {
      return (this.$refs?.gbh !== undefined) ? this.$refs.gbh.getPayload() : [];
    },
    getPayload: function() {
      return {
        type: this.config.type,
        guioptions: this.config.guioptions,
        data: {
          id: this.id,
          funktion: this.funktion,
          orget: this.orget,
          benutzerfunktionid: this.benutzerfunktionid,
          mitarbeiter_uid: this.store.mitarbeiter_uid,
          mode: this.mode,
          gueltigkeit: this.$refs.gueltigkeit.getPayload()
        },
        gbs: this.getGehaltsbestandteilePayload()
      };
    }
  }
}
