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
            <infos :infos="(infos !== undefined) ? infos : []"></infos>
            <errors :errors="(errors !== undefined) ? errors : []"></errors>
            <div class="row g-2 py-2 border-bottom mb-3">
                <dienstverhaeltnis ref="dienstverhaeltnisRef" :config="curdv"></dienstverhaeltnis>
            </div>
        </template>
        <template #footer>
         <div class="btn-toolbar" role="toolbar" aria-label="TmpStore Toolbar">
              <div class="btn-group me-2" role="group" aria-label="Second group">
                  <button class="btn btn-secondary btn-sm float-end" @click="cancel">Abbrechen</button>
              </div>
               <div class="btn-group" role="group" aria-label="First group">
                  <button class="btn btn-primary btn-sm float-end" @click="enddv">Dienstverhältnis beenden</button>
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
      errors: []
    };
  },
  emits: [
    "dvended"
  ],
  components: {
    'Modal': Modal,
    'dienstverhaeltnis': dienstverhaeltnis,
    'infos': infos,
    'errors': errors
  },
  methods: {
    enddv: function() {
      const payload = this.$refs['dienstverhaeltnisRef'].getPayload();
      
      Vue.$fhcapi.DV.endDV(payload)
      .then((response) => {
        this.handleDVEnded(response.data);
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
        this.$refs['modalRef'].show();
    }
  },
  expose: ['showModal']
};
