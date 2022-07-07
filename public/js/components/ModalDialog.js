export const ModalDialog = {
    props: {
        type: String,
        title: String,
    },
    setup(props, { emit }) {
       
        let modalConfirmEle = Vue.ref(null);
        let thisModalObj;
        let _resolve;
        let _reject;

        Vue.onMounted(() => {
            thisModalObj = new bootstrap.Modal(modalConfirmEle.value);
        });
        
        const show = async () => {
            thisModalObj.show();
            return new Promise(function (resolve, reject) {
              _resolve = resolve;
              _reject = reject;
            });
        }

        function hide() {
            thisModalObj.hide();
        }

        const ok = () => {
            _resolve(true);
          }
          
        const cancel = () =>  {
            _resolve(false);
        }

        Vue.defineExpose({ show, hide});

        return { modalConfirmEle, show, hide, ok, cancel };
    },

    template:`
    <div class="modal fade " id="customModalDialog" tabindex="-1" aria-labelledby=""
        aria-hidden="true" ref="modalConfirmEle">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="customModalDialogLabel">{{ title }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <slot name="body" />
                </div>
                <div class="modal-footer">
                    <slot name="footer"></slot>
                    <button type="button" class="btn btn-secondary" @click="cancel" data-bs-dismiss="modal">
                        Abbrechen
                    </button>
                    <button type="button" class="btn btn-primary" @click="ok" data-bs-dismiss="modal">
                        OK
                    </button>
                </div>
            </div>
        </div>
    </div>`
};
