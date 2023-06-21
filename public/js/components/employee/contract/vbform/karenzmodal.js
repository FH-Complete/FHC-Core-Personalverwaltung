import {Modal} from '../../../Modal.js';
import vertragsbestandteil_karenz from '../../../vbform/vertragsbestandteil_karenz.js';
import store from '../../../vbform/vbsharedstate.js';
import errors from '../../../vbform/errors.js';
import infos from '../../../vbform/infos.js';

export default {
  template: `
    <Modal :title="'Karenz verwalten'" :noscroll="true" ref="modalRef" id="karenzModal">
        <template #body>
            <infos :infos="(infos !== undefined) ? infos : []"></infos>
            <errors :errors="(errors !== undefined) ? errors : []"></errors>
            <vertragsbestandteil_karenz ref="vertragsbestandteil_karenzRef" :config="curkarenz"></vertragsbestandteil_karenz>
        </template>
        <template #footer>
         <div class="btn-toolbar" role="toolbar" aria-label="TmpStore Toolbar">
              <div class="btn-group me-2" role="group" aria-label="Second group">
                  <button class="btn btn-secondary btn-sm float-end" @click="cancel">Abbrechen</button>
              </div>
               <div class="btn-group" role="group" aria-label="First group">
                  <button class="btn btn-primary btn-sm float-end" @click="enddv">Karenz speichern</button>
              </div>
          </div>
        </template>
  </Modal>
  `,
  props: [
      'curkarenz'
  ],
  data: function() {
    return {
      store: store, 
      infos: [],
      errors: []
    };
  },
  emits: [
    "karenzsaved"
  ],
  components: {
    'Modal': Modal,
    'vertragsbestandteil_karenz': vertragsbestandteil_karenz,
    'infos': infos,
    'errors': errors
  },
  methods: {
    enddv: function() {
      const payload = this.$refs['vertragsbestandteil_karenzRef'].getPayload();
      
      Vue.$fhcapi.Karenz.saveKarenz(payload)
      .then((response) => {
        this.handleKarenzSaved(response.data);
      });
    },
    cancel: function() {
      this.$refs['modalRef'].hide();  
    },
    handleKarenzSaved: function(resp) {
      if( resp.error > 0 ) {
        this.errors = [resp.retval];
        this.infos = [];
      } else {
        this.infos = [resp.retval];
        this.errors = [];
      }
      this.$emit('karenzsaved', this.curkarenz);  
    },
    showModal: function() {
        this.$refs['modalRef'].show();
    }
  },
  expose: ['showModal']
};
