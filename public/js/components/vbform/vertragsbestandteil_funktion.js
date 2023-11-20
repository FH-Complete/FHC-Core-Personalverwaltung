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
          <input v-model="mode" :disabled="isinputdisabled('mode')" class="form-check-input form-check-input-sm" type="radio"
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
          <label class="form-check-label" :for="'vbfunktionmode2_' + config.guioptions.id">Bestehende Funktion</label>
        </div>
      </div>
      <div class="col-7">&nbsp;</div>
    </div>
    <div class="row g-2">
    <template v-if="mode === 'neu'">
      <div class="col-3">
        <div class="fhc_autocomplete_wrapper">
            <p-autocomplete 
                v-model="autocomplete.selectedfunktion" 
                dropdown
                dropdownMode="current" 
                :suggestions="autocomplete.funktionen" 
                @complete="searchFunktionen"
                optionLabel="label"
                optionDisabled="disabled"
                forceSelection
                :disabled="isinputdisabled('funktion')"
            ></p-autocomplete>
        </div>
<!--        
        <select v-model="funktion" :disabled="isinputdisabled('funktion')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option
            v-for="f in lists.funktionen"
            :value="f.value"
            :selected="isselected(f.value, this.funktion)"
            :disabled="f.disabled">
            {{ f.label }}
          </option>
        </select>
-->
      </div>
      <div class="col-3">
        <div class="fhc_autocomplete_wrapper">
            <p-autocomplete 
                v-model="autocomplete.selectedorget" 
                dropdown 
                dropdownMode="current" 
                :suggestions="autocomplete.orgets" 
                @complete="searchOrgets"
                optionLabel="label"
                optionDisabled="disabled"
                forceSelection
                :disabled="isinputdisabled('orget')"
            ></p-autocomplete>
        </div>
<!--
        <select v-model="orget" :disabled="isinputdisabled('orget')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option
            v-for="oe in lists.orgets"
            :value="oe.value"
            :selected="isselected(oe.value, this.orget)"
            :disabled="oe.disabled">
            {{ oe.label }}
          </option>
        </select>        
-->
      </div>
      <div class="col-1">&nbsp;</div>
    </template>
    <template v-else-if="mode === 'bestehende'">
      <div class="col-6">
        <select v-model="benutzerfunktionid" :disabled="isinputdisabled('benutzerfunktionid')" class="form-select form-select-sm">
          <option
            v-for="bf in lists.benutzerfunktionen"
            :value="bf.value"
            :selected="isselected(bf.value, this.benutzerfunktionid)"
            :disabled="bf.disabled">
            {{ bf.label }}
          </option>
        </select>
      </div>
      <div class="col-1">&nbsp;</div>
    </template>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit" @markended="markGBsEnded"></gueltigkeit>
      <div class="col-1">
        <span v-if="db_delete" class="badge bg-danger">wird gelöscht</span>
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>
        <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="toggledelete" aria-label="Delete"><i v-if="db_delete" class="fas fa-trash-restore"></i><i v-else="" class="fas fa-trash"></i></button>        
      </div>
    </div>
    <gehaltsbestandteilhelper v-if="canhavegehaltsbestandteile" ref="gbh" v-bind:preset="getgehaltsbestandteile"></gehaltsbestandteilhelper>
  </div>
  `,
  components: {
    'gehaltsbestandteilhelper': gehaltsbestandteilhelper,
    'gueltigkeit': gueltigkeit,
    'infos': infos,
    'errors': errors,
    'p-autocomplete': primevue.autocomplete
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
      db_delete: false,
      mode: 'neu',
      lists: {
        funktionen: [],
        orgets: [{
            value: '',
            label: 'Bitte zuerst ein Unternehmen auswählen',
            disabled: true
        }],
        benutzerfunktionen: [{
            value: '',
            label: 'Bitte zuerst ein Unternehmen auswählen',
            disabled: true
        }]
      },
      autocomplete: {
        funktionen: [],
        orgets: [],
        selectedfunktion: '',
        selectedorget: ''
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
      },
      'autocomplete.selectedfunktion': function() {
        if(this.autocomplete.selectedfunktion?.value !== undefined) {
          this.funktion = this.autocomplete.selectedfunktion.value;
        }
      },
      'autocomplete.selectedorget': function() {
        if(this.autocomplete.selectedorget?.value !== undefined) {
          this.orget = this.autocomplete.selectedorget.value;
        }
      }
  },
  methods: {
    isselected: function(optvalue, selvalue) {
      return (optvalue === selvalue);
    },
    resetDropdowns: function() {
      if(!this.isinputdisabled('funktion')) {
        this.funktion = '';
      }
      if(!this.isinputdisabled('orget')) {
        this.orget = '';
      }
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
      if( this.config?.data?.db_delete !== undefined ) {
        this.db_delete = this.config.data.db_delete;
      }
    },
    getFunktionen: async function() {
      const filter = (this.config.guioptions?.filter) ? this.config.guioptions?.filter : 'all';
      const response = await Vue.$fhcapi.Funktion.getContractFunctions(filter);
      const funktionen = response.data.retval;
      funktionen.unshift({
        value: '',
        label: 'Funktion wählen',
        disabled: true
      });
      this.lists.funktionen = funktionen;
      this.autocomplete.funktionen = [...this.lists.funktionen];
      this.setAutocompleteFunktion();
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
      this.autocomplete.orgets = [...this.lists.orgets];
      this.setAutocompleteOrget();
    },
    getCurrentFunctions: async function() {
      if(this.store.unternehmen === '' || this.store.mitarbeiter_uid === '' ) {
        return;  
      }
      const response = await Vue.$fhcapi.Funktion.getCurrentFunctions(this.store.mitarbeiter_uid, this.store.unternehmen);
      const benutzerfunktionen = (response.error === 1) ? [] : response.data.retval;
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
          db_delete: this.db_delete,          
          gueltigkeit: this.$refs.gueltigkeit.getPayload()
        },
        gbs: this.getGehaltsbestandteilePayload()
      };
    },
    searchFunktionen: function(event) {
        var that = this;
        
        setTimeout(function() {
            if (!event.query.trim().length) {
                that.autocomplete.funktionen = [...that.lists.funktionen];
            } else {
                that.autocomplete.funktionen = that.lists.funktionen.filter((item) => {
                    return item.label.toLowerCase().includes(event.query.toLowerCase());
                });
            }
        }, 250);
    },
    searchOrgets: function(event) {
        var that = this;
        
        setTimeout(function() {
            if (!event.query.trim().length) {
                that.autocomplete.orgets = [...that.lists.orgets];
            } else {
                that.autocomplete.orgets = that.lists.orgets.filter((item) => {
                    return item.label.toLowerCase().includes(event.query.toLowerCase());
                });
            }
        }, 250);
    },
    setAutocompleteFunktion: function() {
        if( this.funktion.length > 0 && this.autocomplete.funktionen.length > 0 ) {
          var that = this;
          this.autocomplete.selectedfunktion = this.autocomplete.funktionen.find((item) => {
              return that.funktion === item.value;
          });
        }
    },
    setAutocompleteOrget: function() {
        if( this.orget.length > 0 && this.autocomplete.orgets.length > 0 ) {
          var that = this;
          this.autocomplete.selectedorget = this.autocomplete.orgets.find((item) => {
              return that.orget === item.value;
          });
        }
    }
  }
}
