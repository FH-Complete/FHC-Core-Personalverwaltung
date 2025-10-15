import { EmployeePerson } from './EmployeePerson.js';
import { EmployeeHeader } from './EmployeeHeader.js';
import { EmployeeNav } from './EmployeeNav.js';

//TEST MANU DETAILHEADER
import { EmployeeStatus } from './EmployeeStatus.js'
import CoreDetailsHeader from '../../../../../../public/js/components/DetailHeader/DetailHeader.js';
import ApiIssue from "../../api/factory/issue.js";
import ApiEmployee from "../../api/factory/employee";

export default {
	name: 'EmployeeEditor',
    components: {
        EmployeePerson,
        EmployeeHeader,
        EmployeeNav,
		EmployeeStatus,
		CoreDetailsHeader
    },
    props: {
        personid: Number,
        personuid: String,
        open: Boolean,
        isNew:  Boolean,
    },
    emits: ['personSelected'],
    setup( props, {emit }) {

        const router = VueRouter.useRouter();
    	const route = VueRouter.useRoute();
	//	const { watch, ref, onMounted, inject } = Vue;
        const currentPersonID = Vue.ref(null);
        const currentPersonUID = Vue.ref(null);
        const currentDate = Vue.ref(null);
       // const employeeHeaderRef = Vue.ref();
		const employee = Vue.ref();

		//TODO(Manu) check date
		const formatDate = (ds) => {
			if (ds == null) return '';
			var d = new Date(ds);
			return d?.toISOString().substring(0,10);
		}

		const isFetching = Vue.ref(false);
		const isFetchingName = Vue.ref(false);
		const isFetchingIssues = Vue.ref(false);
		const openissuescount = Vue.ref(null);
		const personalnummer = Vue.ref(null);

		const statusRef = Vue.ref(null);
		const issuesCountRef = Vue.ref(null);
		const $api = Vue.inject('$api');
		const $fhcAlert = Vue.inject('$fhcAlert');

		const redirect = (params) => {
            emit('personSelected', params);
        }

        const dateChanged = (params) => {
            console.log("-> date changed: ", params);
            //currentDate.value=params;
        }

        const updateHandler = () => {
            //employeeHeaderRef.value.refresh();
			console.log("in update handler");
			//statusRef.value.refresh();
			refresh();

        }

		const fetchOpenIssuesCount = async() => {
			isFetchingIssues.value = true;

			try {
				const res = await $api.call(ApiIssue.countPersonOpenIssues(props.personid));
				openissuescount.value = res.data.openissues;
				console.log("in  fetchOpenIssuesCount" + res.data.openissues);
				console.log("in fetchOpenIssuesCount " + props.personid);
			//	$fhcAlert.alertError("in fetchOpenIssuesCount " + props.personid + " - " + openissuescount.value);
			} catch (error) {
				console.log(error);
			} finally {
				isFetchingIssues.value = false;
			}
		};

		//Todo(manu) NOT UPDATING, seems to get the value of last person before
		const checkPerson = async() => {
			isFetchingIssues.value = true;
			//console.log("in checkPerson person_id" + personid);
			try {
				const res = await $api.call(ApiIssue.checkPerson(props.personid));
				openissuescount.value = res.data.openissues;
				console.log("in checkPerson count " + res.data.openissues);
				console.log("in checkPerson used ID " + props.personid);
			//	$fhcAlert.alertError("in checkPerson " + props.personid + " - " + openissuescount.value);

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
				console.log("in fetch header data: person_id " + personid + " uid " + personuid);
				const res = await $api.call(ApiEmployee.personHeaderData(personid, personuid));
				employee.value = res.data[0];
				//personalnummer.value = res.data.personalnummer;
				//const personalnummer = employee.value.personalnummer;

				personalnummer.value = employee.value.personalnummer;

				console.log("employee" + employee.value.personalnummer);
				console.log("personalnummer " + personalnummer.value);
				isFetchingName.value = false;
				// fetch abteilung (needs uid from previous fetch!)
			//	const resAbteilung = await $api.call(ApiEmployee.personAbteilung(employee.value.uid));
				// response = await resAbteilung.json();
			//	employee.value = { ...employee.value, ...{ abteilung: resAbteilung.data } };
			} catch (error) {
				console.log(error);
			}
		/*	finally {
				isFetching.value = false;
				isFetchingName.value = false;
			}*/
		};

		const getStatusTags = ()=> {
			console.log("in getStatusTags");
			const statusArr = []

			if(employee?.value?.unruly) {
				statusArr.push({text: 'Unruly', css: 'bg-unruly rounded-0'})
				console.log("in unruly " + personalnummer.value)
			}
			return statusArr
		}

		const refresh = () => {
			console.log("in refresh");
			console.log("person_id " + props.personid + " uid " + props.personuid);
			console.log("CURRENT person_id " + currentPersonID.value + " uid " + currentPersonUID.value);
			//issuesCountRef.value.refresh();
			fetchHeaderData(currentPersonID.value, currentPersonUID.value);
			fetchOpenIssuesCount(currentPersonID.value);
			checkPerson(currentPersonID.value);
			statusRef.value.refresh();
		}

        Vue.onMounted(() => {

			currentDate.value = route.query.d;
			console.log("date " + currentDate.value);
/*			console.log('EmployeeEditor mounted', route.path);
            currentDate.value = route.query.d;
			fetchOpenIssuesCount(props.personid);*/

			if (props.personid, props.personuid) {
				console.log("in on mounted " + props.personid);
				fetchHeaderData(props.personid, props.personuid);
				fetchOpenIssuesCount(props.personid);
				checkPerson(props.personid);
			}
        })

		Vue.watch(
			() => [route.params, route.query.d],
			([params, d]) => {
				// Handle params
				currentPersonID.value = params.id
				currentPersonUID.value = params.uid

				// Handle query
				console.log('test manu')
				console.log('watch route.query.d', d)
				refresh()
				currentDate.value = d
			}
		)

/*        Vue.watch(
			() => route.params,
			params => {
				currentPersonID.value = params.id;
                currentPersonUID.value = params.uid;
			}
		)

        Vue.watch(
			() => route.query.d,
			d => {
				console.log('test manu');
                console.log('watch route.query.d', d)
				currentDate.value = d;
			}
		)

		{{employee.value.personalnummer}}
		<h6 v-if="!isFetchingIssues" class="text-muted">{{ openissuescount }}</h6>
			    <EmployeeHeader ref="employeeHeaderRef"  :personID="personid" :personUID="personuid" @person-selected="redirect"   ></EmployeeHeader>
		*/

        return {
			redirect,
			dateChanged,
			currentPersonID,
			currentPersonUID,
			currentDate,
		//	employeeHeaderRef,
			updateHandler,
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
			formatDate,
			refresh,
			personalnummer,
			issuesCountRef

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
        	@redirect="redirect"
        	>
				<template #issues>
					<h4 class="mb-1">Issues<a class="refresh-issues" @click="checkPerson"><i class="fas fa-sync"></i></a></h4>
					<h6 class="text-muted" ref="issuesCountRef">{{ openissuescount }}</h6>
				</template>
				<template #titleAddTile>pNr</template>
				<template #valueAddTile>{{ personalnummer }}</template>
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
