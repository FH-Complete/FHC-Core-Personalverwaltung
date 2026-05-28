import gehaltsbestandteilhelper from './gehaltsbestandteilhelper.js';
import gueltigkeit from './gueltigkeit.js';
import configurable from '../../mixins/vbform/configurable.js';
import errors from './errors.js';
import infos from './infos.js';
import store from './vbsharedstate.js';
import ApiKollektivvertrag from  '../../../js/api/factory/kollektivvertrag.js';

export default {
  name: 'VertragsbestandteilKollektivvertrag',
  template: `
  <div class="card card-body my-2">
   <div class="py-0">
    <infos :infos="(config?.guioptions?.infos !== undefined) ? config?.guioptions?.infos : []"></infos>
    <errors :errors="(config?.guioptions?.errors !== undefined) ? config?.guioptions?.errors : []"></errors>

    <div class="row g-2 py-2">
      <div class="col-6">
        <select v-model="verwendungsgruppe_kurzbz" :disabled="isinputdisabled('verwendungsgruppe_kurzbz')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option
            v-for="f in lists.verwendungsgruppen"
            :value="f.value"
            :selected="isselected(f.value, this.verwendungsgruppe_kurzbz)"
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

    <div class="row g-2 py-2" v-show="showinput('verwendungsgruppenjahr')">
      <div class="col-6">
        <select v-model="kv_jahre" :disabled="isinputdisabled('kv_jahre')" class="form-select form-select-sm" aria-label=".form-select-sm example">
          <option
            v-for="f in lists.verwendungsgruppenjahre"
            :value="f.value"
            :selected="isselected(f.value, this.kv_jahre)"
            :disabled="f.disabled">
            {{ f.label }}
          </option>
        </select>
      </div>
      <div class="col-6">&nbsp;</div>
    </div>


    <div class="row g-2 py-2" v-show="showinput('kommentar')">
      <div class="col-6">
        <textarea v-model="kommentar" rows="2" class="form-control form-control-sm" placeholder="Kommentar zur Person" aria-label="Kommentar zur Person"></textarea>
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
      kommentar: '',
      verwendungsgruppe_kurzbz: '',
      kv_jahre: null,
      db_delete: false,
      lists: {
        verwendungsgruppen: [],
        verwendungsgruppenjahre: [],
      },
      store: store
    };
  },
  created: function() {
    this.getVerwendungsgruppen();
    this.getVerwendungsgruppenjahre();
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
      if( this.config?.data?.kommentar !== undefined ) {
        this.kommentar = this.config.data.kommentar;
      }
      if( this.config?.data?.verwendungsgruppe_kurzbz !== undefined ) {
        this.verwendungsgruppe_kurzbz = this.config.data.verwendungsgruppe_kurzbz;
      }
      if( this.config?.data?.kv_jahre !== undefined ) {
        this.kv_jahre = this.config.data.kv_jahre;
      }  
      if( this.config?.data?.db_delete !== undefined ) {
        this.db_delete = this.config.data.db_delete;
      }
    },
    getVerwendungsgruppen: async function() {
          const response = await this.$api.call(ApiKollektivvertrag.getVerwendungsgruppen());
          const verwendungsgruppen = response.data;
          verwendungsgruppen.unshift({
            value: '',
            label: 'Verwendungsgruppe wählen',
            disabled: true
          });
          this.lists.verwendungsgruppen = verwendungsgruppen;
    },
    getVerwendungsgruppenjahre: async function() {
          const response = await this.$api.call(ApiKollektivvertrag.getVerwendungsgruppenjahre());
          const verwendungsgruppenjahre = response.data;
          verwendungsgruppenjahre.unshift({
            value: '',
            label: 'VG-Jahre wählen',
            disabled: true
          });
          this.lists.verwendungsgruppenjahre = verwendungsgruppenjahre;
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
          verwendungsgruppe_kurzbz: this.verwendungsgruppe_kurzbz,  
          kv_jahre: this.kv_jahre,
          kommentar: this.kommentar,
          db_delete: this.db_delete,
          gueltigkeit: this.$refs.gueltigkeit.getPayload(),
        }
      };
    }
  }
}
