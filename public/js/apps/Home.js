
const pvApp = Vue.createApp(	{
	components: {
		EmployeeChooser,
		Sidebar,	
		ContractCountCard,
		BirthdayCountCard,
		DeadlineIssueTable,
	},
	setup() {


		Vue.onMounted(() => {
		})

		return {
		}
	}
}).mount('#wrapper');
