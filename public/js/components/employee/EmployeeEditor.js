import { EmployeePerson } from './EmployeePerson.js';
import { EmployeeNav } from './EmployeeNav.js';
import { EmployeeStatus } from './EmployeeStatus.js'
import CoreDetailsHeader from '../../../../../js/components/DetailHeader/DetailHeader.js';
import ApiIssue from "../../api/factory/issue.js";
import ApiEmployee from "../../api/factory/employee.js";

export default {
	name: 'EmployeeEditor',
	components: {
		EmployeePerson,
		EmployeeNav,
		EmployeeStatus,
		CoreDetailsHeader,
		"p-skeleton": primevue.skeleton,
	},
	props: {
		personid: Number,
		personuid: String,
		open: Boolean,
		isNew:  Boolean,
	},
	expose: ['refresh'],
	emits: ['personSelected'],
	setup( props, {emit }) {

		const route = VueRouter.useRoute();
		const currentPersonID = Vue.ref(null);
		const currentPersonUID = Vue.ref(null);
		const employee = Vue.ref();

		const isFetching = Vue.ref(false);
		const isFetchingName = Vue.ref(false);
		const isFetchingIssues = Vue.ref(false);
		const openissuescount = Vue.ref(null);
		const personalnummer = Vue.ref(null);
		const statusRef = Vue.ref(null);
		const $api = Vue.inject('$api');

		const redirect = (params) => {
			emit('personSelected', params);
		}

		const fetchOpenIssuesCount = async(person_id) => {
			isFetchingIssues.value = true;

			try {
				const res = await $api.call(ApiIssue.countPersonOpenIssues(person_id));
				openissuescount.value = res.data.openissues;
			} catch (error) {
				console.log(error);
			} finally {
				isFetchingIssues.value = false;
			}
		};

		const checkPerson = async() => {
			isFetchingIssues.value = true;
			try {
				const res = await $api.call(ApiIssue.checkPerson(props.personid));
				openissuescount.value = res.data.openissues;
			} catch (error) {
				console.log(error);
			}
			finally {
				isFetchingIssues.value = false;
			}
		};

		const fetchHeaderData = async (personid, personuid) => {
			isFetching.value = true;
			isFetchingName.value = true;
			try {
				// fetch header data
				const res = await $api.call(ApiEmployee.personHeaderData(personid, personuid));
				employee.value = res.data[0];
				personalnummer.value = employee.value.personalnummer;
				isFetchingName.value = false;
			} catch (error) {
				console.log(error);
			}
			finally {
				isFetching.value = false;
				isFetchingName.value = false;
			}
		};

		const getStatusTags = ()=> {
			const statusArr = []
			if(employee?.value?.unruly) {
				statusArr.push({text: 'Unruly', css: 'bg-unruly rounded-0'})
			}
			return statusArr
		}

		const refresh = () => {
			statusRef.value.refresh();
		}

		const updateHeaderHandler = () => {
			fetchHeaderData(props.personid, props.personuid);
			checkPerson(props.personid);
			statusRef.value.refresh();
		}

		Vue.onMounted(() => {
			if (props.personid, props.personuid) {
				fetchHeaderData(props.personid, props.personuid);
				fetchOpenIssuesCount(props.personid);
			}
		})

		Vue.watch(
			() => [route.params, route.query.d],
			([params, d]) => {
				// Handle params
				currentPersonID.value = params.id
				currentPersonUID.value = params.uid

				if (currentPersonID.value!=null) {
					fetchHeaderData(currentPersonID.value, currentPersonUID.value);
					fetchOpenIssuesCount(currentPersonID.value);
				}
				refresh()
			}
		)

		return {
			redirect,
			currentPersonID,
			currentPersonUID,
			fetchHeaderData,
			statusRef,
			getStatusTags,
			isFetchingIssues,
			checkPerson,
			openissuescount,
			FHC_JS_CONFIG,
			employee,
			isFetching,
			isFetchingName,
			refresh,
			personalnummer,
			updateHeaderHandler
		}
	},
	template: `    
        <CoreDetailsHeader
        	ref="CoreDetailsHeaderRef"
        	:person_id="personid"
        	:mitarbeiter_uid="personuid"
        	typeHeader="mitarbeiter"
        	:domain="FHC_JS_CONFIG.domain"
        	fotoEditable
        	@redirectToLeitung="redirect"
        	>
				<template #issues>
					<h4 class="mb-1">Issues<a class="refresh-issues" title="erneut prüfen" href="javascript:void(0);" @click="checkPerson"><i class="fas fa-sync"></i></a></h4>
					<h6 v-if="!isFetchingIssues" class="text-muted">{{ openissuescount }}</h6>
					<h6 v-else class="mb-2"><p-skeleton v-if="isFetchingIssues" style="width:45%"></p-skeleton></h6>
				</template>
				<template #titleAlphaTile>PNr</template>
				<template #valueAlphaTile>{{ personalnummer }}</template>
				<template #uid>
					{{personuid}}
				</template>
				<template #tag>
					<EmployeeStatus ref="statusRef" :tags="getStatusTags()"></EmployeeStatus>
				</template>
		</CoreDetailsHeader>

        <EmployeeNav   :personID="currentPersonID" :personUID="currentPersonUID"  ></EmployeeNav>
        <router-view @updateHeader="updateHeaderHandler"></router-view>
    `
}
