/* eslint-disable camelcase */
/* eslint-disable no-console */
import { useContext, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import NonAuditedDisclaimer from 'components/molecules/NonAuditedDisclaimer';
import CreateContractFlow from 'components/organisms/CreateContractFlow';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import Layout from 'components/templates/Layout';
import createContract from 'controllers/createContract';
import { getPriceForStrike, OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import moment from 'moment';
import { useRouter } from 'next/router';
import useContractStore from 'store/useContractStore';
import * as UrlBuilder from 'utils/urlBuilder';

// import dynamic from 'next/dynamic';
// const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

const CreateContractPage = () => {
	const contractStore = useContractStore();
	const currentCluster = getCurrentCluster();
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [initParams, setInitParams] = useState<OtcInitializationParams>({
		depositStart: moment().add(-60, 'minutes').toDate().getTime(),
		depositEnd: moment().add(5, 'minutes').toDate().getTime(),
		settleStart: moment().add(15, 'minutes').toDate().getTime(),

		juniorDepositAmount: 100,
		seniorDepositAmount: 100,

		redeemLogicOption: {
			redeemLogicPluginType: 'forward',
			notional: 1,
			strike: 0,
			isCall: true,
			isLinear: true
		},

		rateOption: {
			ratePluginType: 'pyth',
			rateAccounts: [
				currentCluster === 'devnet' ? 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix' : 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'
				// currentCluster === 'devnet' ? 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix' : 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'
			]
		},

		// USDC in mainnet, devUSD in devnet
		reserveMint: currentCluster === 'devnet' ? '7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W' : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
		saveOnDatabase: process.env.NODE_ENV !== 'development',
		sendNotification: process.env.NODE_ENV !== 'development'
	});

	const isPresentTempData = contractStore?.contractData != null;
	useEffect(() => {
		if (contractStore?.contractData) {
			setInitParams(contractStore?.contractData);
			contractStore.delete();
		} else {
			getPriceForStrike(initParams.rateOption.ratePluginType, initParams.rateOption.rateAccounts, connection, getCurrentCluster()).then((newStrike) => {
				setInitParams({ ...initParams, redeemLogicOption: { ...initParams.redeemLogicOption, strike: newStrike } });
			});
		}
	}, []);

	const [isLoading, setIsLoading] = useState(false);

	const onCreateContractButtonClick = async () => {
		try {
			setIsLoading(true);

			// create contract
			const otcPublicKey = await createContract(provider, txHandler, initParams);

			// Create contract URL
			router.push(UrlBuilder.buildContractSummaryUrl(otcPublicKey.toBase58()));
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Layout>
			<NonAuditedDisclaimer />
			<Box sx={{ width: '75vh', alignItems: 'center', my: 2 }}>
				{/* <DynamicReactJson src={initParams} /> */}
				<CreateContractFlow
					initialStep={isPresentTempData ? 4 : 0}
					contractInitParams={initParams}
					onContractInitParamsChange={setInitParams}
					isLoading={isLoading}
					onCreateContractButtonClick={onCreateContractButtonClick}
				/>
			</Box>
		</Layout>
	);
};

export default CreateContractPage;
