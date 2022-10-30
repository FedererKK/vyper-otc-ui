import { FetchContractsParams } from 'controllers/fetchContracts/FetchContractsParams';
import { DbOtcState } from 'models/DbOtcState';
import { AVAILABLE_RATE_PLUGINS, AVAILABLE_REDEEM_LOGIC_PLUGINS } from 'models/plugins/AbsPlugin';

import { CONTRACTS_METADATA_TABLE_NAME, CONTRACTS_TABLE_NAME, supabase } from './client';

export const selectContracts = async (params: FetchContractsParams): Promise<DbOtcState[]> => {
	const query = supabase.from(CONTRACTS_TABLE_NAME).select(
		`
			        *,
			        ${CONTRACTS_METADATA_TABLE_NAME} (
			            *
			        )
			    `
	);

	params.lte.forEach((f) => query.lte(f.column, f.value));
	params.gte.forEach((f) => query.gte(f.column, f.value));
	params.gt.forEach((f) => query.gt(f.column, f.value));
	params.lt.forEach((f) => query.lt(f.column, f.value));
	params.eq.forEach((f) => query.eq(f.column, f.value));

	// filter for fetching only supported plugins in the UI
	query.in('redeem_logic_plugin_type', AVAILABLE_REDEEM_LOGIC_PLUGINS);
	query.in('rate_plugin_type', AVAILABLE_RATE_PLUGINS);

	const res = await query;

	if (res.error) throw Error(res.error.message);

	return res.data.map<DbOtcState>((c) => DbOtcState.fromSupabaseSelectRes(c));
};
