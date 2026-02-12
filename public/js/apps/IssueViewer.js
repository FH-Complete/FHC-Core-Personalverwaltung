import IssueViewer from '../components/issues/IssueViewer.js';
import FhcAlert from '../../../../js/plugins/FhcAlert.js';
import Phrasen from '../../../../js/plugins/Phrasen.js';
import FhcApi from "../../../../js/plugins/Api.js";
const app = Vue.createApp({
	components: {
		IssueViewer
	}
});

app
	.use(FhcAlert)
	.use(Phrasen)
	.use(FhcApi)
	.mount('#main');