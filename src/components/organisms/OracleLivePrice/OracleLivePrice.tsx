/* eslint-disable no-console */

import { Skeleton } from '@mui/material';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import { RatePluginTypeIds } from 'models/plugins/AbsPlugin';

type OracleLivePriceInput = {
	oracleType: RatePluginTypeIds;
	pubkey: string;
};

const OracleLivePrice = ({ oracleType, pubkey }: OracleLivePriceInput) => {
	const { pricesValue, isInitialized } = useOracleLivePrice(oracleType, [pubkey]);
	return !isInitialized ? <Skeleton variant="rectangular" width={80} height={20} animation="wave" /> : <p>{pricesValue[0]}</p>;
};

export default OracleLivePrice;
