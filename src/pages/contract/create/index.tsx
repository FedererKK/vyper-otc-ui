/* eslint-disable camelcase */
/* eslint-disable no-console */
import { useContext, useEffect, useState } from 'react';

import { FormControlLabel, FormGroup, Switch, Box } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import ExpiryPicker from 'components/molecules/ExpiryPicker';
import NonAuditedDisclaimer from 'components/molecules/NonAuditedDisclaimer';
import OraclesPicker from 'components/molecules/OraclesPicker';
import PayoffPicker from 'components/molecules/PayoffPicker';
import ReservePicker from 'components/molecules/ReservePicker';
import ParamsPicker from 'components/molecules/ParamsPicker';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import Layout from 'components/templates/Layout';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { Button, Combobox, IconButton, Pane, RefreshIcon, TextInputField } from 'evergreen-ui';
import { AVAILABLE_RATE_PLUGINS, AVAILABLE_REDEEM_LOGIC_PLUGINS, RatePluginTypeIds, RedeemLogicPluginTypeIds } from 'models/plugins/AbsPlugin';
import { RatePythPlugin } from 'models/plugins/rate/RatePythPlugin';
import RateSwitchboardPlugin from 'models/plugins/rate/RateSwitchboardPlugin';
import moment from 'moment';
import { useRouter } from 'next/router';
import { getOraclesByType } from 'utils/oracleDatasetHelper';
import * as UrlBuilder from 'utils/urlBuilder';

// RATE PLUGINS

// eslint-disable-next-line no-unused-vars
const SwitchboardAggregatorPicker = ({ title, value, onChange }: { title: string; value: string; onChange: (val: string) => void }) => {
	const filteredOracles = getOraclesByType('switchboard');

	return (
		<Pane display="flex" alignItems="center">
			<Combobox
				placeholder={title}
				width="100%"
				items={filteredOracles}
				itemToString={(item) => (item ? item.title : '')}
				onChange={(e) => {
					return onChange(e.pubkey);
				}}
			/>
		</Pane>
	);
};

// eslint-disable-next-line no-unused-vars
const PythPricePicker = ({ title, value, onChange }: { title: string; value: string; onChange: (_: string) => void }) => {
	const filteredOracles = getOraclesByType('pyth');

	return (
		<Pane display="flex" alignItems="center">
			<Combobox
				placeholder={title}
				width="100%"
				items={filteredOracles}
				itemToString={(item) => (item ? item.title : '')}
				onChange={(e) => {
					return onChange(e.pubkey);
				}}
			/>
		</Pane>
	);
};

const CreateContractPage = () => {
	const currentCluster = getCurrentCluster();
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);
	const [saveOnDatabase, setSaveOnDatabase] = useState(process.env.NODE_ENV === 'development' ? false : true);
	const [sendNotification, setSendNotification] = useState(process.env.NODE_ENV === 'development' ? false : true);

	const [reserveMint, setReserveMint] = useState('');

	// assume deposit always starts open
	// eslint-disable-next-line no-unused-vars
	const [depositStart, setDepositStart] = useState(moment().add(-60, 'minutes').toDate().getTime());
	const [depositEnd, setDepositEnd] = useState(moment().add(5, 'minutes').toDate().getTime());
	const [settleStart, setSettleStart] = useState(moment().add(15, 'minutes').toDate().getTime());

	const [seniorDepositAmount, setSeniorDepositAmount] = useState(100);
	const [juniorDepositAmount, setJuniorDepositAmount] = useState(100);

	const [redeemLogicPluginType, setRedeemLogicPluginType] = useState<RedeemLogicPluginTypeIds>('forward');
	const [ratePluginType, setRatePluginType] = useState<RatePluginTypeIds>('pyth');
	const [rate1, setRate1] = useState('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');
	const [rate2, setRate2] = useState('J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix');

	const [notional, setNotional] = useState(1);
	const [strike, setStrike] = useState(0);
	const [isCall, setIsCall] = useState(true);

	const setRateMain = (rateType: RatePluginTypeIds, rateValue1: string) => {
		setRatePluginType(rateType);
		setRate1(rateValue1);
	};

	const setStrikeToDefaultValue = async () => {
		try {
			if (ratePluginType === 'pyth') {
				const [, price] = await RatePythPlugin.GetProductPrice(connection, currentCluster, new PublicKey(rate1));
				setStrike(price?.price ?? 0);
			}
			if (ratePluginType === 'switchboard') {
				const [, price] = await RateSwitchboardPlugin.LoadAggregatorData(connection, new PublicKey(rate1));
				setStrike(price ?? 0);
			}
		} catch {
			setStrike(0);
		}
	};

	useEffect(() => {
		setStrikeToDefaultValue();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ratePluginType, rate1]);

	const onCreateContractButtonClick = async () => {
		try {
			setIsLoading(true);

			const rateAccounts: PublicKey[] = [];
			rateAccounts.push(new PublicKey(rate1));
			if (redeemLogicPluginType === 'settled_forward') {
				rateAccounts.push(new PublicKey(rate2));
			}

			let redeemLogicOption: OtcInitializationParams['redeemLogicOption'];

			if (redeemLogicPluginType === 'forward') {
				redeemLogicOption = {
					redeemLogicPluginType,
					isLinear: true,
					notional,
					strike
				};
			} else if (redeemLogicPluginType === 'settled_forward') {
				redeemLogicOption = {
					redeemLogicPluginType,
					isLinear: true,
					notional,
					strike,
					isStandard: false
				};
			} else if (redeemLogicPluginType === 'digital') {
				redeemLogicOption = {
					redeemLogicPluginType,
					strike,
					isCall
				};
			} else if (redeemLogicPluginType === 'vanilla_option') {
				redeemLogicOption = {
					redeemLogicPluginType,
					strike,
					notional,
					isCall,
					isLinear: true
				};
			} else {
				throw Error('redeem logic plugin not supported: ' + redeemLogicPluginType);
			}

			const initParams: OtcInitializationParams = {
				reserveMint: new PublicKey(reserveMint),
				depositStart,
				depositEnd,
				settleStart,
				seniorDepositAmount,
				juniorDepositAmount,
				rateOption: {
					ratePluginType,
					rateAccounts
				},
				redeemLogicOption,
				saveOnDatabase,
				sendNotification
			};

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
			<Box sx={{ width: '75vh', alignItems: 'center' }}>
				<PayoffPicker value={redeemLogicPluginType} onChange={setRedeemLogicPluginType} />

				<hr />

				<ParamsPicker
					redeemLogic={redeemLogicPluginType}
					strike={strike}
					setStrike={setStrike}
					notional={notional}
					setNotional={setNotional}
					isCall={isCall}
					setIsCall={setIsCall}
				/>

				<hr />

				<OraclesPicker onChange={setRateMain} onChangeSecondary={setRate2} rate={ratePluginType} redeemLogic={redeemLogicPluginType} />

				<hr />

				<ReservePicker
					seniorDepositAmount={seniorDepositAmount}
					setSeniorDepositAmount={setSeniorDepositAmount}
					juniorDepositAmount={juniorDepositAmount}
					setJuniorDepositAmount={setJuniorDepositAmount}
					setReserveMint={setReserveMint}
				/>

				<hr />

				<ExpiryPicker depositEnd={depositEnd} setDepositEnd={setDepositEnd} settleStart={settleStart} setSettleStart={setSettleStart} />

				{process.env.NODE_ENV === 'development' && (
					<FormGroup>
						<FormControlLabel control={<Switch checked={saveOnDatabase} onChange={(e) => setSaveOnDatabase(e.target.checked)} />} label="Save on database" />
						<FormControlLabel
							control={<Switch checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)} />}
							label="Send notification"
						/>
					</FormGroup>
				)}
				<Button isLoading={isLoading} disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
					{wallet.connected ? 'Create Contract' : 'Connect Wallet'}
				</Button>
			</Box>
		</Layout>
	);
};

export default CreateContractPage;
