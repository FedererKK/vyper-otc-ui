import { useContext, useState } from 'react';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { airdrop } from 'api/dummy-tokens/airdrop';
import { TxHandlerContext } from 'components/providers/TxHandlerProvider';
import { CloudDownloadIcon, Spinner, Tooltip } from 'evergreen-ui';
import { toast } from 'react-toastify';

const AirdropButton = () => {
	const { connection } = useConnection();
	const wallet = useWallet();
	const txHandler = useContext(TxHandlerContext);

	const [isLoading, setIsLoading] = useState(false);

	const onAirdropClick = async () => {
		setIsLoading(true);

		try {
			const tx = await airdrop(connection, wallet.publicKey);
			await txHandler.handleTxs(tx);

			toast.success('Airdrop completed');
		} catch (err) {
			// console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	if (!wallet.connected) return <></>;

	if (isLoading) return <Spinner size={24} />;

	return (
		<Tooltip content="Airdrop tokens">
			<p onClick={onAirdropClick}>
				<CloudDownloadIcon /> Airdrop
			</p>
		</Tooltip>
	);
};

export default AirdropButton;
