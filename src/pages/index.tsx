/* eslint-disable no-console */
import { useContext, useState } from 'react';
import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertTitle, Box, Button, CircularProgress, Collapse, Grid, IconButton, Stack, Typography } from '@mui/material';
import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { Connection } from '@solana/web3.js';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import Layout from 'components/templates/Layout';
import createContract from 'controllers/createContract';
import { OtcInitializationParams } from 'controllers/createContract/OtcInitializationParams';
import { useOracleLivePrice } from 'hooks/useOracleLivePrice';
import moment from 'moment';
import { useRouter } from 'next/router';
import { getOracleByPubkey } from 'utils/oracleDatasetHelper';
import * as UrlBuilder from 'utils/urlBuilder';

const CreateGoldContractPage = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const router = useRouter();

	const provider = new AnchorProvider(connection, wallet, {});
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);

	const saveOnDatabase = false;
	const sendNotification = false;

	// oracle to be used, 'pyth' and 'switchboard' are available
	const oracle = 'pyth';
	// pubkey of the asset to be used from the above oracle
	const PUBKEY_ASSET_ONE = '4GqTjGm686yihQ1m1YdTsSvfm4mNfadv6xskzgCYWNC5';

	// setting the asset to be used and initialized by the oracle, this is equal to
	const asset = PUBKEY_ASSET_ONE;

	const { pricesValue, isInitialized } = useOracleLivePrice(oracle, [asset]);
	// const oracleData = getOracleByPubkey(asset);

	// for Accordion
	const [open, setOpen] = React.useState(true);

	const onCreateContractButtonClick = async () => {
		try {
			if (getCurrentCluster() !== 'devnet') {
				alert('this page is only available on devnet');
				return;
			}

			setIsLoading(true);

			const redeemLogicOption: OtcInitializationParams['redeemLogicOption'] = {
				redeemLogicPluginType: 'forward',
				strike: pricesValue[0],
				notional: 1,
				isStandard: true,
				isLinear: true
			};

			const depositStart = moment().toDate().getTime();
			const depositEnd = moment().add(2, 'days').toDate().getTime();
			const settleStart = moment().add(30, 'days').toDate().getTime();

			const initParams: OtcInitializationParams = {
				reserveMint: '7XSvJnS19TodrQJSbjUR6tEGwmYyL1i9FX7Z5ZQHc53W',
				depositStart,
				depositEnd,
				settleStart,
				seniorDepositAmount: 100,
				juniorDepositAmount: 100,
				rateOption: {
					ratePluginType: oracle,
					rateAccounts: [asset]
				},
				redeemLogicOption,
				saveOnDatabase,
				sendNotification
			};

			// create contract
			const otcPublicKey = await createContract(provider, txHandler, initParams);

			// dump log in console
			console.log(initParams);

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
			<Box>
				<Stack spacing={2} direction="column" justifyContent="center" alignItems="center">
					<h1>DeFi Gold marketplace</h1>
					<Collapse in={open}>
						<Alert
							severity="info"
							action={
								<IconButton
									aria-label="close"
									color="inherit"
									size="small"
									onClick={() => {
										setOpen(false);
									}}
								>
									<CloseIcon fontSize="inherit" />
								</IconButton>
							}
							sx={{ mb: 2 }}
						>
							On this page, you are creating a 1-month contract on the price of XAU (gold). <br></br>
							<b>Steps required:</b> <br></br>
							1) Have a Solana wallet like Phantom or Solflare <br></br>
							2) Be on devnet and have <a href="https://solfaucet.com/">some SOL</a> in your wallet <br></br>
							3) Connect wallet and request airdrop of fake USDC, your counterparty will need them too! <br></br>
							4) Initiate the contract by clicking <i>Create contract</i> <br></br>
							5) Share the contract URL with your counterparty <br></br>
							6) Both parties will deposit the collateral and the trade is started <br></br>
						</Alert>
					</Collapse>
					<Box
						component="img"
						sx={{
							// height: 233,
							// width: 350,
							// maxHeight: { xs: 233, md: 167 },
							maxWidth: { xs: 600, md: 400 }
						}}
						alt="gold-img"
						src="/gold-img.png"
					/>
					<Grid container spacing={2} justifyContent="center" alignItems="center">
						{/* <Button variant="outlined" onClick={() => ButtonClickUpdateAsset(PUBKEY_ASSET_ONE)}>
							GOLD
						</Button> */}
						{/* <Button variant="outlined" onClick={() => ButtonClickUpdateAsset(PUBKEY_ASSET_TWO)}>
							BTC
						</Button> */}
					</Grid>
					<div>
						<h6>LIVE PRICE: ${pricesValue[0] ? pricesValue[0].toFixed(4) : 'Loading..'}</h6>
					</div>
					<br></br>
					This will deploy the contract on DEVNET with $100 fake USDC.
					<Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
						{isLoading ? (
							<CircularProgress />
						) : (
							<Button variant="contained" disabled={!wallet.connected} onClick={onCreateContractButtonClick}>
								{wallet.connected ? 'Create trade 🔥🚀' : 'Connect wallet'}
							</Button>
						)}
					</Stack>
					<hr />
					<Alert sx={{ maxWidth: '800px' }} severity="info" variant="outlined">
						<AlertTitle>Why would you buy gold?</AlertTitle>
						<Typography>
							<br /> As the global economy continues to fluctuate, many people are turning to gold as a way to protect their wealth and ensure financial
							stability. Gold has long been considered a safe haven for investors, and for good reason. One of the biggest benefits of investing in gold is its
							inherent value. Unlike stocks and bonds, which are subject to market fluctuations, gold has a consistent value that is determined by its rarity
							and demand. This means that even when the stock market is volatile, gold is a reliable option for protecting your investments. Another benefit of
							investing in gold is its ability to act as a hedge against inflation. Over time, the value of money tends to decrease due to inflation. Gold, on
							the other hand, retains its value, which means that your investment will be worth more in the long run. <br></br>
						</Typography>
						<br></br>
						<AlertTitle>Why with a derivative?</AlertTitle>
						<Typography>
							<br></br>
							While buying physical gold can be a good investment, many people are turning to gold derivatives, such as gold futures and options, as a way to
							invest in gold without the need for storage or security. Gold derivatives allow investors to speculate on the price of gold without actually
							owning the physical metal. This means that investors can reap the benefits of investing in gold without the added costs and risks associated with
							buying and storing physical gold. In summary, investing in gold has many benefits, including its inherent value, ability to protect against
							inflation, and liquidity. By investing in gold derivatives, investors can take advantage of these benefits without the added costs and risks of
							buying and storing physical gold.<br></br>
						</Typography>
					</Alert>
				</Stack>
			</Box>
		</Layout>
	);
};

export default CreateGoldContractPage;
