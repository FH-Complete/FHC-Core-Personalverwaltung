export const DropDownButton = {
    props: {
        links: { type: Array, required: true }
    },
    expose: [ 'show', 'toggle', 'hide'],
    setup() {

        let buttonEle = Vue.ref(null);
        let thisDropDownButtonObj;

        Vue.onMounted(() => {
            thisDropDownButtonObj = new bootstrap.Dropdown(buttonEle.value);
        });

        const show = () => {
            thisDropDownButtonObj.show();
        }

        const toggle = () => {
            thisDropDownButtonObj.toggle();
        }

        const hide = () => {
            thisDropDownButtonObj.hide();
        }

        return { show, toggle, hide, buttonEle };

    },
    template: `
        <div class="btn-group" role="group" ref="buttonEle">
            <button  type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <slot></slot>
            </button>
            <ul class="dropdown-menu" >
                <li v-for="link in links"><a class="dropdown-item" href="#" @click="link.action">{{ link.text }}</a></li>
            </ul>
        </div>`
}
