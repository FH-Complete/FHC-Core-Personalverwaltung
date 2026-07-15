import {Modal} from '../../../Modal.js';
import ApiEmployee from '../../../../api/factory/employee.js';

export default {
  name: 'DeleteDvModal',
  template: `
    <Modal :title="'Dienstverhältnis löschen'" :noscroll="true" ref="modalRef" 
           id="deleteDvModal">
        <template #body>
            <div class="row g-2 py-2 border-bottom mb-3">
                <em>{{ dvlabel }} - Wirklich löschen?</em>
            </div>
        </template>
        <template #footer>
         <div class="btn-toolbar" role="toolbar" aria-label="TmpStore Toolbar">
              <div class="btn-group me-2" role="group" aria-label="Second group">
                  <button class="btn btn-secondary btn-sm float-end" @click="cancel">Abbrechen</button>
              </div>
               <div class="btn-group" role="group" aria-label="First group">
                  <button class="btn btn-primary btn-sm float-end" @click="deletedv">Dienstverhältnis löschen</button>
              </div>
          </div>
        </template>
  </Modal>
  `,
  props: [
      'curdv'
  ],
  emits: [
    "dvdeleted"
  ],
  components: {
    'Modal': Modal
  },
  inject: ['$api', '$fhcAlert'],
  methods: {
    deletedv: async function() {  
      try {
        const res = await this.$api.call(ApiEmployee.deleteDV(this.curdv.dienstverhaeltnisid)); 
        this.$emit('dvdeleted');
        this.$refs['modalRef'].hide();
      } catch (error) {
        console.log(error);
      }
    },
    cancel: function() {
      this.$refs['modalRef'].hide();  
    },
    showModal: function() {
        this.$refs['modalRef'].show();
    } 
  },
  computed: {
    dvlabel: function() {
        if( this.curdv?.label !== undefined ) {
            return this.curdv.label
        } else {
            return '';
        }
    }  
  },
  expose: ['showModal']
};
