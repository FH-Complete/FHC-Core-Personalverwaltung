import gehaltsbestandteilhelper from './gehaltsbestandteilhelper.js';
import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';
import store from './vbsharedstate.js';
import ApiLohnguide from  '../../../js/api/factory/lohnguide.js';

export default {
  name: 'VertragsbestandteilLohnguide',
  template: `
  <div class="card card-body my-2">
   <div class="py-0">
    <infos :infos="(config?.guioptions?.infos !== undefined) ? config?.guioptions?.infos : []"></infos>
    <errors :errors="(config?.guioptions?.errors !== undefined) ? config?.guioptions?.errors : []"></errors>

    <div class="row g-2 py-2">
      <div class="col-6">
        <select v-model="fachrichtung_kurzbz" :disabled="isinputdisabled('fachrichtung_kurzbz')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option
            v-for="f in lists.fachrichtungen"
            :value="f.value"
            :selected="isselected(f.value, this.fachrichtung_kurzbz)"
            :disabled="f.disabled">
            {{ f.label }}
          </option>
        </select>
      </div>
      <div class="col-1">&nbsp;</div>
      <gueltigkeit ref="gueltigkeit" :config="getgueltigkeit" @markended="markGBsEnded"></gueltigkeit>
      <div class="col-1 pe-3">
        <span v-if="db_delete" class="badge bg-danger">wird gelöscht</span>
        <button v-if="isremoveable" type="button" class="btn-close btn-sm p-2 float-end" @click="removeVB" aria-label="Close"></button>
        <button v-if="isdeleteable" type="button" class="btn btn-sm p-2 float-end" @click="toggledelete" aria-label="Delete"><i v-if="db_delete" class="fas fa-trash-restore"></i><i v-else="" class="fas fa-trash"></i></button>
      </div>
    </div>      

    <div class="row g-2 py-2" v-show="showinput('stellenbezeichnung')">
      <div class="col-6">
        <select v-model="modellstelle_kurzbz" :disabled="isinputdisabled('modellstelle_kurzbz')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option
            v-for="f in lists.modellstellen"
            :value="f.value"
            :selected="isselected(f.value, this.modellstelle_kurzbz)"
            :disabled="f.disabled">
            {{ f.label }}
          </option>
        </select>
      </div>
      <div class="col-6">&nbsp;</div>
    </div>

    <div class="row g-2 py-2" v-show="showinput('stellenbezeichnung')">
      <div class="col-6">
        <input v-model="stellenbezeichnung" type="text" class="form-control form-control-sm" placeholder="Stellenbezeichnung" aria-label="Stellenbezeichnung">
      </div>
      <div class="col-6">&nbsp;</div>
    </div>

    <div class="row g-2 py-2" v-show="showinput('kommentar_person')">
      <div class="col-6">
        <textarea v-model="kommentar_person" rows="2" class="form-control form-control-sm" placeholder="Kommentar zur Person" aria-label="Kommentar zur Person"></textarea>
      </div>
      <div class="col-6">&nbsp;</div>
    </div>

    <div class="row g-2 py-2" v-show="showinput('kommentar_modellstelle')">
      <div class="col-6">
        <textarea v-model="kommentar_modellstelle" rows="2" class="form-control form-control-sm" placeholder="Kommentar zur Modellstelle" aria-label="Kommentar zur Modellstelle"></textarea>
      </div>
      <div class="col-6">&nbsp;</div>
    </div>

   </div>
  </div>
  `,
  components: {
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
      stellenbezeichnung: '',
      kommentar_person: '',
      kommentar_modellstelle: '',
      fachrichtung_kurzbz: '',
      modellstelle_kurzbz: '',
      db_delete: false,
      lists: {
        modellstellen: [],
        fachrichtungen: [],
      },
      store: store
    };
  },
  created: function() {
    this.getModellstellen();
    this.getFachrichtungen();
    this.setDataFromConfig();
  },
  inject: ['$api'],
  methods: {
    isselected: function(optvalue, selvalue) {
      return (optvalue === selvalue);
    },
    setDataFromConfig: function() {
      if( this.config?.data?.id !== undefined ) {
        this.id = this.config.data.id;
      }
      if( this.config?.data?.stellenbezeichnung !== undefined ) {
        this.stellenbezeichnung = this.config.data.stellenbezeichnung;
      }
      if( this.config?.data?.kommentar_person !== undefined ) {
        this.kommentar_person = this.config.data.kommentar_person;
      }
      if( this.config?.data?.kommentar_modellstelle !== undefined ) {
        this.kommentar_modellstelle = this.config.data.kommentar_modellstelle;
      }
      if( this.config?.data?.fachrichtung_kurzbz !== undefined ) {
        this.fachrichtung_kurzbz = this.config.data.fachrichtung_kurzbz;
      }
      if( this.config?.data?.modellstelle_kurzbz !== undefined ) {
        this.modellstelle_kurzbz = this.config.data.modellstelle_kurzbz;
      }  
      if( this.config?.data?.db_delete !== undefined ) {
        this.db_delete = this.config.data.db_delete;
      }
    },
    getFachrichtungen: async function() {
          const response = await this.$api.call(ApiLohnguide.getFachrichtungen());
          const fachrichtungen = response.data;
          fachrichtungen.unshift({
            value: '',
            label: 'Fachrichtung wählen',
            disabled: true
          });
          this.lists.fachrichtungen = fachrichtungen;
    },
    getModellstellen: async function() {
          const response = await this.$api.call(ApiLohnguide.getModellstellen());
          const modellstellen = response.data;
          modellstellen.unshift({
            value: '',
            label: 'Modellstelle wählen',
            disabled: true
          });
          this.lists.modellstellen = modellstellen;
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
          stellenbezeichnung: this.stellenbezeichnung,
          kommentar_modellstelle: this.kommentar_modellstelle,
          kommentar_person: this.kommentar_person,
          fachrichtung_kurzbz: this.fachrichtung_kurzbz,  
          modellstelle_kurzbz: this.modellstelle_kurzbz,
          db_delete: this.db_delete,
          gueltigkeit: this.$refs.gueltigkeit.getPayload(),
        }
      };
    }
  }
}
