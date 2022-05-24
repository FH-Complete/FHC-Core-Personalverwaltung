
const pvApp = Vue.createApp(	{
	components: {
		EmployeeChooser,
		Sidebar,
		EmployeeEditor,
		EmployeeTable,
	},
	data() {
		return 	{
			tabledata: tableData,
			isEditorOpen: false,
			currentPersonID: null,
		}
	},
	methods: {
		personSelectedHandler(id) {
			console.log('personSelected: ', id);
			this.isEditorOpen=true;
			this.currentPersonID = id;
		},
		closeEditorHandler() {
			this.isEditorOpen=false;
		}
	}
}).mount('#wrapper');
