import gehaltsbestandteilhelper from './gehaltsbestandteilhelper.js';
import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';

export default {
  name: 'VertragsbestandteilStunden',
  template: `
  <div class="card card-body my-2">
    <div class="py-0">
      <infos :infos="(config?.guioptions?.infos !== undefined) ? config?.guioptions?.infos : []"></infos>
      <errors :errors="(config?.guioptions?.errors !== undefined) ? config?.guioptions?.errors : []"></errors>
      <div class="row g-2">
        <div class="col-3">
          <div class="input-group input-group-sm mb-3">
            <input v-model="stunden" :disabled="isinputdisabled('stunden')" type="text" class="form-control form-control-sm" placeholder="Stunden" aria-label="stunden">
            <span class="input-group-text">Std/Woche</span>
          </div>
        </div>
        <div class="col-3">
          <select v-model="teilzeittyp_kurzbz" :disabled="isinputdisabled('teilzeittyp_kurzbz')" class="form-select form-select-sm" aria-label=".form-select-sm example">
            <option
              v-for="f in lists.teilzeittypen"
              :value="f.value"
              :selected="isselected(f.value, this.teilzeittyp_kurzbz)"
              :disabled="f.disabled">
              {{ f.label }}
            </option>
          </select>
        </div>
        <div class="col-1">&nbsp;</div>
        <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit" @markended="markGBsEnded" @gueltigkeitchanged="gueltigkeitchanged"></gueltigkeit>
        <div class="col-1 pe-3">
          <span v-if="db_delete" class="badge bg-danger">wird gelöscht</span>
          <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>
          <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="toggledelete" aria-label="Delete"><i v-if="db_delete" class="fas fa-trash-restore"></i><i v-else="" class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
    <gehaltsbestandteilhelper ref="gbh" v-bind:preset="getgehaltsbestandteile"></gehaltsbestandteilhelper>
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
      stunden: '',
      teilzeittyp_kurzbz: '',
      lists: {
        teilzeittypen: []
      },
      db_delete: false
    };
  },
  created: function() {
    this.getTeilzeittypen();
    this.setDataFromConfig();
  },
  inject: ['$fhcApi'],
  methods: {
    gueltigkeitchanged: function(payload) {
      console.log(JSON.stringify(payload));  
    },
    isselected: function(optvalue, selvalue) {
      return (optvalue === selvalue);
    },
    setDataFromConfig: function() {
      if( this.config?.data?.id !== undefined ) {
        this.id = this.config.data.id;
      }
      if( this.config?.data?.stunden !== undefined ) {
        if(!isNaN(this.config.data.stunden)) {
            this.config.data.stunden = this.config.data.stunden.toString();
        }
        this.stunden = this.config.data.stunden.replace('.', ',');
      }
      if( this.config?.data?.teilzeittyp_kurzbz !== undefined) {
        this.teilzeittyp_kurzbz = this.config.data.teilzeittyp_kurzbz != null 
            ? this.config.data.teilzeittyp_kurzbz : '';
      }
      if( this.config?.data?.db_delete !== undefined ) {
        this.db_delete = this.config.data.db_delete;
      }
    },
    getTeilzeittypen: async function() {
      const response = await this.$fhcApi.factory.Stunden.getTeilzeittypen();
      const teilzeittypen = response.retval;
      teilzeittypen.unshift({
        value: '',
        label: 'Teilzeittyp wählen',
        disabled: false
      });
      this.lists.teilzeittypen = teilzeittypen;
    },
    removeVB: function() {
      this.$emit('removeVB', {id: this.config.guioptions.id});
    },
    getPayload: function() {
      return {
        type: this.config.type,
        guioptions: this.config.guioptions,
        data: {
          id: this.id,
          stunden: this.stunden.replace(',', '.'),
          teilzeittyp_kurzbz: this.teilzeittyp_kurzbz, 
          db_delete: this.db_delete,
          gueltigkeit: this.$refs.gueltigkeit.getPayload()
        },
        gbs: this.$refs.gbh.getPayload()
      };
    }
  }
}
