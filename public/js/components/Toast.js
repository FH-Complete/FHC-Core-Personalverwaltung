const Toast = {
    props: {
        title: {
            text: String,
            default: "<<Text goes here>>",
        }
    },
    setup() {

        let toastEle = Vue.ref(null);
        let thisToastObj;

        Vue.onMounted(() => {
            thisToastObj = new bootstrap.Toast(toastEle.value);
        });

        const show = () => {
            thisToastObj.show();
        }

        const hide = () => {
            thisToastObj.hide();
        }

        Vue.defineExpose({ show, hide });

        return { show, hide, toastEle };

    },
    template: `
    <div class="toast align-items-center text-white bg-primary border-0 " role="alert" aria-live="assertive" aria-atomic="true" ref="toastEle">
        <div class="d-flex">
            <div class="toast-body">
            <slot name="body"></slot>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>`
}
