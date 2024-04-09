export const progressbar = {
    props: {
        percent: {
            type: Number, 
            default: 0,
            validator(value) {
                return value>=0.0 && value<=100.0;
            }          
        },
        bgType: {
            type: String, 
            default: 'bg-success'  // bg-success, bg-info, bg-warning, bg-danger
        },  
    },
    setup(props, { emit }) {        
  
    },

    template:`
    <div 
        class="progress" 
        role="progressbar"         
        :aria-valuenow="percent"
        aria-valuemin="0"
        aria-valuemax="100">
        <div class="progress-bar"  :class="bgType" :style="'width: ' + percent+'%;'"></div>
    </div>`
};
