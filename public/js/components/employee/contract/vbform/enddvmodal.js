import {Modal} from '../../../Modal.js';
import dienstverhaeltnis from '../../../vbform/dienstverhaeltnis.js';
import store from '../../../vbform/vbsharedstate.js';
import errors from '../../../vbform/errors.js';
import infos from '../../../vbform/infos.js';

export default {
  template: `
    <Modal :title="'Dienstverhältnis beenden'" :noscroll="true" ref="modalRef" 
           :class="'vbformModal'" id="endDvModal">
        <template #body>
            <infos v-show="store.showmsgs" :infos="(infos !== undefined) ? infos : []"></infos>
            <errors v-show="store.showmsgs" :errors="(errors !== undefined) ? errors : []"></errors>
            <div class="row g-2 py-2 border-bottom mb-3">
                <dienstverhaeltnis ref="dienstverhaeltnisRef" :config="curdv" :showdvcheckoverlap="false"></dienstverhaeltnis>
            </div>

            <input type="checkbox" v-model="unrulyInternal" id="unruly" :disabled="spinners.saving" ref="unrulyCheckbox">
			<label for="unruly" style="margin-left: 12px;" >{{ $p.t('studierendenantrag', 'mark_person_as_unruly') }}</label>

            
        </template>
        <template #footer>
         <div class="btn-toolbar" role="toolbar" aria-label="TmpStore Toolbar">
              <div class="btn-group me-2" role="group" aria-label="Second group">
                  <button class="btn btn-secondary btn-sm float-end" @click="cancel">Abbrechen</button>
              </div>
               <div class="btn-group" role="group" aria-label="First group">
                <button class="btn btn-primary btn-sm float-end" @click="enddv">
                  <span v-show="spinners.saving" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Dienstverhältnis beenden
                </button>
              </div>
          </div>
        </template>
  </Modal>
  `,
  props: [
      'curdv'
  ],
  data: function() {
    return {
      store: store, 
      infos: [],
      errors: [],
      spinners: {
        saving: false
      },
      unrulyInternal: false
    };
  },
  emits: [
    "dvended", "updateunruly"
  ],
  inject: ['$fhcApi', '$fhcAlert'],
  components: {
    'Modal': Modal,
    'dienstverhaeltnis': dienstverhaeltnis,
    'infos': infos,
    'errors': errors
  },
  methods: {
    enddv: function() {
      this.spinners.saving = true;
      this.store.showmsgs = false;
      const payload = this.$refs['dienstverhaeltnisRef'].getPayload();
      
      this.$fhcApi.factory.DV.endDV(payload)
      .then((response) => {
        this.handleDVEnded(response);
      }).then(() => {
        if(!this.unrulyInternal) return

        // TODO maybe add updateUnruly into pv21 api for concurrency reasons
        this.$fhcapi.factory.Person.updatePersonUnruly({
          person_id: this.curdv.person_id,
          unruly: this.unrulyInternal
        }).then((response) => {
          this.$emit('updateunruly', this.unrulyInternal);
        })

      })
      .finally(() => {
          this.spinners.saving = false;
          this.store.showmsgs = true;
      });
    },
    cancel: function() {
      this.$refs['modalRef'].hide();  
    },
    handleDVEnded: function(resp) {
      if( resp.error > 0 ) {
        this.errors = [resp.retval];
        this.infos = [];
      } else {
        this.infos = [resp.retval];
        this.errors = [];
      }
      this.$emit('dvended', this.curdv);  
    },
    showModal: function() {
        this.store.mode = 'korrektur';
        this.$refs['modalRef'].show();
    },
    saveUnrulyPerson: function () {
        this.spinners.saving = true;
        this.store.showmsgs = false;

        this.$fhcapi.factory.Person.updatePersonUnruly({
          person_id: this.curdv.person_id,
          unruly: this.unrulyInternal
        }).then((response) => {
          this.$emit('updateunruly', this.unrulyInternal);
        }).finally(() => {
          this.spinners.saving = false;
          this.store.showmsgs = true;
        });
    }
  },
  watch: {
    curdv(newVal) {
      this.unrulyInternal = newVal.unruly
    }
  },
  expose: ['showModal']
};