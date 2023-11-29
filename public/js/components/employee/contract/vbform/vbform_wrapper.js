import presets from '../../../../apps/vbform/presets/presets.js.php';
import debug_viewer from '../../../vbform/debug_viewer.js';
import vbformhelper from '../../../vbform/vbformhelper.js';
import store from '../../../vbform/vbsharedstate.js';
import presets_chooser from '../../../vbform/presets_chooser.js';
import {Modal} from '../../../Modal.js';
import tmpstorehelper from '../../../vbform/tmpstorehelper.js';
import vbgb2gui from '../../../../helpers/vbform/vbgb2gui.js';
import Phrasen from '../../../../../../../js/mixins/Phrasen.js';
import savedpayloadchecker from '../../../../helpers/vbform/savedpayloadchecker.js';

export default {
  template: `
    <Modal :title="getTitle" ref="modalRef" 
           :class="'vbformModal'" id="vbformModal" :noscroll="true">
        <template #body>
    
        <div class="vbformutilities flex-shrink-0 flex-grow-0">
            <div class="row p-2 bg-light">
              <div class="col-3">
                <presets_chooser ref="presetchooserRef" :presets="presets" @presetselected="handlePresetSelected" :showselectmode="false"></presets_chooser>
              </div>
              <div class="col-1 text-center py-2">
                <em>{{p.t('vbform', 'oder')}}</em>
              </div>
              <div class="col-8">
                <tmpstorehelper ref="tmpstorehelper" @loadedfromtmpstore="handleLoadedFromTmpStore" @savetotmpstore="saveToTmpStore"></tmpstorehelper>
              </div>
            </div>
        </div>
        
        <vbformhelper ref="vbformhelperRef" :preset="preset"></vbformhelper>

        <div v-if="debug" class="row">
          <div class="col-12">
            <debug_viewer v-bind:text="vbhjson"></debug_viewer>
          </div>
        </div>
        
    </template>
        <template #footer>
         <div class="btn-toolbar" role="toolbar" aria-label="TmpStore Toolbar">
              <div v-if="mode === 'aenderung' || mode === 'korrektur'" class="btn-group me-2" role="group" aria-label="Second group">
                  <button class="btn btn-outline-secondary btn-sm float-end" @click="reload">Zurücksetzen</button>
              </div>
              <div class="btn-group me-2" role="group" aria-label="Second group">
                  <button class="btn btn-secondary btn-sm float-end" @click="validate">Eingaben prüfen</button>
              </div>
               <div class="btn-group" role="group" aria-label="First group">
                  <button class="btn btn-primary btn-sm float-end" @click="save">{{ getSaveButtonLabel }}</button>
              </div>
          </div>
        </template>
  </Modal>
  `,
  props: [
      'mode',
      'title',
      'mitarbeiter_uid',
      'curdv',
      'debug'
  ],
  data: function() {
    return {
      vbhjson: presets,
      presets: presets,
      preset: null,
      store: store
    };
  },
  emits: [
    "dvsaved"
  ],
  mixins: [
    Phrasen
  ],
  components: {
    'presets_chooser': presets_chooser,
    'debug_viewer': debug_viewer,
    'vbformhelper': vbformhelper,
    'Modal': Modal,
    "tmpstorehelper": tmpstorehelper
  },
  created: function() {
    this.resetStoreDV();
    this.store.setMode(this.mode);
    this.resetpreset();
    this.store.mitarbeiter_uid = this.mitarbeiter_uid;
  },
  watch: {
    changedModeOrCurDV: function(oldval, newval) {
      this.resetTmpStoreHelper();
      this.resetStoreDV();
      if( oldval[0] === newval[0] ) {
          this.$refs['presetchooserRef'].selectmode();
      } else {
        this.store.setMode(this.mode);
      }
    }
  },
  methods: {
    resetStoreDV: function() {
      if( this.mode === 'aenderung' || this.mode === 'korrektur' ) {
        // TODO cleanup and remove again
        this.store.dv.data = {};
        this.store.dv.data.vertragsart_kurzbz = this.curdv.vertragsart_kurzbz;
      }  
    },
    resetpreset: function() {
        var preset = {
        type: 'preset',
        guioptions: {

        },
        children: [],
        dv: {
          data: {
            dienstverhaeltnisid: null,
            gueltigkeit: {
                data: {},
                guioptions: {}
            }
          }
        },
        vbs: {}
      };
      this.presetselected(preset);
    },
    presetselected: function(preset) {
      if( this.mode === 'aenderung' || this.mode === 'korrektur' ) {
        preset.dv.data.dienstverhaeltnisid = preset.dv.data.dienstverhaeltnisid ?? this.curdv.dienstverhaeltnis_id;
        preset.dv.data.unternehmen = (preset.dv.data.unternehmen !== '') ? preset.dv.data.unternehmen : this.curdv.oe_kurzbz;
        preset.dv.data.vertragsart_kurzbz = preset.dv.data.vertragsart_kurzbz ?? this.curdv.vertragsart_kurzbz;
        preset.dv.data.gueltigkeit.data = {
            gueltig_ab: (preset.dv.data.gueltigkeit?.data?.gueltig_ab !== undefined) ? preset.dv.data.gueltigkeit.data.gueltig_ab : this.curdv.von,
            gueltig_bis: (preset.dv.data.gueltigkeit?.data?.gueltig_bis !== undefined) ? preset.dv.data.gueltigkeit.data.gueltig_bis : this.curdv.bis
        };
        preset.dv.data.gueltigkeit.guioptions.sharedstatemode = 'ignore';
        if( this.mode === 'aenderung' ) {
          preset.dv.data.gueltigkeit.guioptions.disabled = [
              'gueltig_ab',
              'gueltig_bis'
          ];
        }
      }
      this.preset = preset;
      this.presettostore();
    },
    presettostore: function() {
      this.store.reset();
      var vbs = JSON.parse(JSON.stringify(this.preset.vbs));
      for( var key in vbs ) {
        this.store.addVB(key, vbs[key]);
      }
      var dv = JSON.parse(JSON.stringify(this.preset.dv));
      this.store.setDV(dv);
    },
    searchforvbs: function(data, child, preset) {
        for(const vb of data) {            
            if( child.guioptions.vertragsbestandteiltyp === 'vertragsbestandteil' + vb.vertragsbestandteiltyp_kurzbz ) {
                // TODO handle different funktionstypen bzw. freitexttypen
                if(vb.vertragsbestandteiltyp_kurzbz === 'freitext') {
                    if( child?.guioptions?.filter !== undefined 
                            && child.guioptions.filter.freitexttyp.indexOf(vb.freitexttyp_kurzbz) === -1 ) {
                      continue;
                    }                    
                } else if( vb.vertragsbestandteiltyp_kurzbz === 'funktion' ) {
                    if( child?.guioptions?.filter !== undefined 
                            && vb.benutzerfunktiondata.funktion_kurzbz.match(/zuordnung/) 
                            && child.guioptions.filter !== 'zuordnung') {
                        continue;
                    } 
                    if( child?.guioptions?.filter !== undefined 
                            && !vb.benutzerfunktiondata.funktion_kurzbz.match(/zuordnung/) 
                            && child.guioptions.filter !== 'funktion') {
                        continue;
                    }
                }
                var vbgui = vbgb2gui.vb2gui(vb, this.store.mode, child);
                preset.vbs[vbgui.guioptions.id] = vbgui;
                child.children.push(vbgui.guioptions.id);
            }
        }
    },
    iterateChilds: function(childs, data, preset) {
        for(const child of childs) {            
            if( child.type === 'vertragsbestandteillist' ) {
               this.searchforvbs(data, child, preset); 
            }
            
            if( child?.children !== undefined ) {
                this.iterateChilds(child.children, data, preset);
            }
        }
    },
    save: function() {
      const payload = this.$refs['vbformhelperRef'].getPayload();
      
      const that = this;
      Vue.$fhcapi.Vertrag.saveForm(this.store.mitarbeiter_uid, payload)
      .then((response) => {
        that.handleSaved(response.data.data);
      });
    },
    validate: function() {
      const payload = this.$refs['vbformhelperRef'].getPayload();
      
      const that = this;
      Vue.$fhcapi.Vertrag.saveForm(this.store.mitarbeiter_uid, payload, 'dryrun')
      .then((response) => {
        that.handleValidated(response.data.data);
      });
    },        
    handlePresetSelected: function(preset) {
      if( this.mode === 'aenderung' ) {
        var preset = JSON.parse(JSON.stringify(preset));
        Vue.$fhcapi.Vertragsbestandteil.getCurrentAndFutureVBs(this.curdv.dienstverhaeltnis_id)
        .then((response) => {          
          this.iterateChilds(preset.children, response.data.data, preset);          
          this.presetselected(preset);
          this.resetTmpStoreHelper();
        });
      } else if( this.mode === 'korrektur' ) {
        var preset = JSON.parse(JSON.stringify(preset));
        Vue.$fhcapi.Vertragsbestandteil.getAllVBs(this.curdv.dienstverhaeltnis_id)
        .then((response) => {          
          this.iterateChilds(preset.children, response.data.data, preset);          
          this.presetselected(preset);
          this.resetTmpStoreHelper();
        });
      } else {
        this.presetselected(preset);
        this.resetTmpStoreHelper();
      }
    },
    handleValidated: function(payload) {
        this.presetselected(payload);      
    },
    handleSaved: function(payload) {
      this.$refs['tmpstorehelper'].deleteFromTmpStorePromise()
        .then(() => {
        this.$refs['tmpstorehelper'].fetchTmpStoreList();
        savedpayloadchecker.checkpayload(payload);
        this.presetselected(payload);
        const dvid = payload.dv.data.dienstverhaeltnisid;
        this.$emit('dvsaved', dvid);
      });
    },
    handleLoadedFromTmpStore: function(payload) {
      this.presetselected(payload);
      this.$refs['presetchooserRef'].resetSelectedPreset();
    },
    showModal: function() {
        this.$refs['modalRef'].show();
    },
    resetTmpStoreHelper: function() {
        this.$refs['tmpstorehelper'].fetchTmpStoreList(true);
        this.store.setTmpStoreId(null);
    },
    saveToTmpStore: function() {
      const formdata = this.$refs['vbformhelperRef'].getPayload();
      const payload = {
        tmpStoreId: this.store.getTmpStoreId(),
        typ: this.store.getMode(),  
        mitarbeiter_uid: this.store.mitarbeiter_uid,  
        formdata: formdata
      };
      Vue.$fhcapi.TmpStore.storeToTmpStore(payload)
      .then((response) => {
        this.store.setTmpStoreId(response.data.meta.tmpstoreid);
        this.$refs['tmpstorehelper'].fetchTmpStoreList(false);
        this.$refs['presetchooserRef'].resetSelectedPreset();
        console.log('storeToTmpStore executed.');
      });
    },
    reload: function() {
        this.$refs['presetchooserRef'].selectpreset();
    }
  },
  expose: ['showModal'],
  computed: {
    getTitle: function() {
        var suffix = '';
        switch (this.mode) {
            case 'korrektur':
                suffix = 'korrigieren';
                break;
            case 'aenderung':
                suffix = 'bearbeiten';
                break;
            case 'neuanlage':
            default:
                suffix = 'anlegen';
                break;
        }

        return this.title + ' ' + suffix;
    },
    getSaveButtonLabel: function() {
        if( this.store.mode === 'aenderung' ) {
            return 'Änderung speichern';
        } else if ( this.store.mode === 'korrektur' ) {
            return 'Korrektur speichern';
        } else {
            return 'Dienstverhältnis anlegen';
        }
    },
    changedModeOrCurDV: function() {
        return [
            this.mode,
            this.curdv
        ];
    }
  }
};
