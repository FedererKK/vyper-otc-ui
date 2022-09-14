import { AnchorProvider } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import Layout from 'components/templates/Layout/Layout';
import { Pane, Text, Table } from 'evergreen-ui';
import { useGetFetchOTCStateQuery } from 'hooks/useGetFetchOTCStateQuery';
import { useRouter } from 'next/router';

export default function SummaryPage() {
	const router = useRouter();
	const { id } = router.query;

	const { connection } = useConnection();
	const wallet = useWallet();
	const provider = new AnchorProvider(connection, wallet, {});

	const rateStateQuery = useGetFetchOTCStateQuery(provider, id as string);

	return (
		<Layout>
			<Pane clearfix margin={24}>
				<Pane justifyContent="center" alignItems="center" flexDirection="column" marginBottom={24}>
					<Text>
						using public key: <code>{id}</code>
					</Text>
				</Pane>
				<Pane justifyContent="center" alignItems="center" flexDirection="column">
					{!rateStateQuery.data && <Text>Fetching</Text>}
					{rateStateQuery.data && (
						<Table>
							<Table.Body>
								{Object.keys(rateStateQuery.data).map((k) => {
									return (
										<Table.Row key={k}>
											<Table.TextCell>{k}</Table.TextCell>
											<Table.TextCell>{rateStateQuery.data[k]?.toString()}</Table.TextCell>
										</Table.Row>
									);
								})}
							</Table.Body>
						</Table>
					)}
				</Pane>
			</Pane>
		</Layout>
	);
}
