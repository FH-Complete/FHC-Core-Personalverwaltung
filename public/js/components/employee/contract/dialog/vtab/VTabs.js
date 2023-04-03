export default {     
     setup( props, { slots } ) {  
        const tabTitles = Vue.ref(slots.default().map((tab) => tab.props.title))
        const selectedTitle = Vue.ref(tabTitles.value[0])
        const selectTab = (title) => { selectedTitle.value = title }
        Vue.provide("selectedTitle", selectedTitle)
        return { selectedTitle, tabTitles, selectTab }
     },
     template: `
     <div class="vtabs">
        <ul class="vtabs_header">
            <li v-for="title in tabTitles" @click="selectTab(title)" :class="{ selected: title == selectedTitle }" :key="title">{{ title }}</li>
        </ul>
        <slot></slot>
     </div>
     `
}     