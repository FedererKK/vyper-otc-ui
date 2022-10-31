import { useState, useEffect } from 'react';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box } from '@mui/material';
import { DataGrid, GridColumns, GridRowParams, GridRenderCellParams, GridActionsCellItem } from '@mui/x-data-grid';
import { useConnection } from '@solana/wallet-adapter-react';
import { getExplorerLink } from '@vyper-protocol/explorer-link-helper';
import ContractStatusBadge from 'components/molecules/ContractStatusBadge';
import MomentTooltipSpan from 'components/molecules/MomentTooltipSpan';
import PublicKeyLink from 'components/molecules/PublicKeyLink';
import { getCurrentCluster } from 'components/providers/OtcConnectionProvider';
import fetchContracts from 'controllers/fetchContracts';
import { FetchContractsParams } from 'controllers/fetchContracts/FetchContractsParams';
import { Badge } from 'evergreen-ui';
import { Spinner } from 'evergreen-ui';
import { ChainOtcState } from 'models/ChainOtcState';
import { AVAILABLE_REDEEM_LOGIC_PLUGINS } from 'models/plugins/AbsPlugin';
import { AbsRatePlugin } from 'models/plugins/rate/AbsRatePlugin';
import { RedeemLogicForwardPlugin } from 'models/plugins/redeemLogic/RedeemLogicForwardPlugin';
import { RedeemLogicSettledForwardPlugin } from 'models/plugins/redeemLogic/RedeemLogicSettledForwardPlugin';
import { RedeemLogicDigitalPlugin } from 'models/plugins/redeemLogic/RedeemLogicDigitalPlugin';
import * as UrlBuilder from 'utils/urlBuilder';

import OracleLivePrice from '../OracleLivePrice';

// @ts-ignore
BigInt.prototype.toJSON = function () {
	return this.toString();
};

const ExplorerContractDataGrid = () => {
	const { connection } = useConnection();

	const [contractsLoading, setContractsLoading] = useState(false);
	const [contracts, setContracts] = useState<ChainOtcState[]>([]);

	useEffect(() => {
		setContractsLoading(true);
		setContracts([]);
		fetchContracts(connection, FetchContractsParams.buildNotExpiredContractsQuery(getCurrentCluster()))
			.then((c) => setContracts(c))
			.finally(() => setContractsLoading(false));
	}, [connection]);

	const columns: GridColumns<ChainOtcState> = [
		{
			type: 'singleSelect',
			field: 'redeemLogicState.typeId',
			headerName: 'Instrument',
			sortable: false,
			filterable: true,
			valueOptions: AVAILABLE_REDEEM_LOGIC_PLUGINS,
			flex: 1,
			minWidth: 150,
			renderCell: (params: GridRenderCellParams<string>) => <Badge>{params.value}</Badge>,
			valueGetter: (params) => {
				return params.row.redeemLogicState.typeId;
			}
		},
		{
			type: 'string',
			field: 'rateState.title',
			headerName: 'Underlying',
			flex: 1,
			minWidth: 150,
			valueGetter: (params) => {
				return params.row.rateState.title;
			}
		},
		{
			type: 'number',
			field: 'redeemLogicState.notional',
			headerName: 'Size',
			flex: 1,
			valueGetter: (params) => {
				if (params.row.redeemLogicState.typeId === 'forward') {
					return (params.row.redeemLogicState as RedeemLogicForwardPlugin).notional;
				} else if (params.row.redeemLogicState.typeId === 'settled_forward') {
					return (params.row.redeemLogicState as RedeemLogicSettledForwardPlugin).notional;
				} else if (params.row.redeemLogicState.typeId === 'digital') {
					// TODO: find common columns
					return '-';
				} else {
					return '-';
				}
			}
		},
		{
			type: 'number',
			field: 'redeemLogicState.strike',
			headerName: 'Strike',
			flex: 1,
			valueGetter: (params) => {
				if (params.row.redeemLogicState.typeId === 'forward') {
					return (params.row.redeemLogicState as RedeemLogicForwardPlugin).strike;
				} else if (params.row.redeemLogicState.typeId === 'settled_forward') {
					return (params.row.redeemLogicState as RedeemLogicSettledForwardPlugin).strike;
				} else if (params.row.redeemLogicState.typeId === 'digital') {
					return (params.row.redeemLogicState as RedeemLogicDigitalPlugin).strike;
				} else {
					return '-';
				}
			}
		},
		{
			type: 'number',
			field: 'rateState.aggregatorLastValue',
			headerName: 'Current Price',
			renderCell: (params: GridRenderCellParams<any>) => (
				<OracleLivePrice oracleType={params.row.rateState.typeId} pubkey={(params.row.rateState as AbsRatePlugin).livePriceAccounts[0].toBase58()} />
			),
			flex: 1,
			minWidth: 125
		},
		{
			field: 'settleAvailableFromAt',
			type: 'dateTime',
			headerName: 'Expiry',
			renderCell: (params: GridRenderCellParams<number>) => <MomentTooltipSpan datetime={params.value} />,
			sortable: true,
			filterable: true,
			flex: 1
		},
		{
			type: 'boolean',
			field: 'buyerFunded',
			headerName: 'Long funded',
			sortable: true,
			filterable: true,
			flex: 1,
			valueGetter: (params) => {
				return params.row.isBuyerFunded();
			}
		},
		{
			type: 'boolean',
			field: 'sellerFunded',
			headerName: 'Short funded',
			sortable: true,
			filterable: true,
			flex: 1,
			valueGetter: (params) => {
				return params.row.isSellerFunded();
			}
		},
		{
			field: 'buyerWallet',
			headerName: 'Buyer wallet',
			sortable: true,
			filterable: true,
			flex: 1,
			renderCell: (params) => {
				if (!params.row.buyerWallet) return <></>;
				return <PublicKeyLink address={params.row.buyerWallet?.toBase58()} />;
			}
		},
		{
			field: 'sellerWallet',
			headerName: 'Seller wallet',
			sortable: true,
			filterable: true,
			flex: 1,
			renderCell: (params) => {
				if (!params.row.sellerWallet) return <></>;
				return <PublicKeyLink address={params.row.sellerWallet?.toBase58()} />;
			}
		},
		{
			field: 'contractStatus',
			headerName: 'Status',
			sortable: true,
			filterable: true,
			flex: 1,
			renderCell: (params) => {
				return <ContractStatusBadge status={params.row.getContractStatus()} />;
			}
		},
		{
			field: 'actions',
			type: 'actions',
			headerName: 'Show details',
			flex: 1,
			getActions: (params: GridRowParams) => [
				<GridActionsCellItem
					key="open"
					icon={<OpenInNewIcon />}
					onClick={() => window.open(window.location.origin + UrlBuilder.buildContractSummaryUrl(params.id.toString()))}
					label="Open"
				/>,
				<GridActionsCellItem
					key="open_in_explorer"
					icon={<OpenInNewIcon />}
					onClick={() => window.open(getExplorerLink(params.id.toString(), { explorer: 'solana-explorer', cluster: getCurrentCluster() }))}
					label="Open in Explorer"
					showInMenu
				/>,
				<GridActionsCellItem
					key="open_in_solscan"
					icon={<OpenInNewIcon />}
					onClick={() => window.open(getExplorerLink(params.id.toString(), { explorer: 'solscan', cluster: getCurrentCluster() }))}
					label="Open in Solscan"
					showInMenu
				/>
			]
		}
	];

	return (
		<>
			{contractsLoading && <Spinner />}

			{contracts.length > 0 && (
				<Box sx={{ maxWidth: 1600, width: '90%' }}>
					<DataGrid autoHeight getRowId={(row) => row.publickey.toBase58()} rows={contracts} columns={columns} />
				</Box>
			)}
		</>
	);
};

export default ExplorerContractDataGrid;
