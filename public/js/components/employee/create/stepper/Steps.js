import { ref, provide } from 'vue';

export default {     
     expose: ['selectedTitle', 'selectStep', 'reset'],
     setup( props, { slots } ) {  
        const stepTitles = ref(slots.default().map((step) => step.props.title))
        const selectedTitle = ref(stepTitles.value[0])
        const selectStep = (title) => { selectedTitle.value = title }
        const reset = () => selectedTitle.value = stepTitles.value[0];
        provide("selectedTitle", selectedTitle)

        return { selectedTitle, stepTitles, selectStep, reset }
     },
     template: `
     <div class="steps">
        <slot></slot>
     </div>
     `
}     