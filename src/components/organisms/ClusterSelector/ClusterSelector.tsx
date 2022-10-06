/* eslint-disable indent */
import { useContext, useEffect, useState } from 'react';

import cn from 'classnames';
import { UrlProviderContext } from 'components/providers/UrlClusterBuilderProvider';
import RPC_ENDPOINTS from 'configs/rpc_endpoints.json';
import { SettingsIcon, Pane, RadioGroup, Popover } from 'evergreen-ui';
import { useRouter } from 'next/router';

import styles from './ClusterSelector.module.scss';
import { toast } from 'react-toastify';

type ClusterSelectorProps = {
	className?: string;
};

const ClusterSelector = ({ className }: ClusterSelectorProps) => {
	const clusters = RPC_ENDPOINTS.map((cluster) => {
		return { label: cluster.cluster, value: cluster.cluster };
	});

	const urlProvider = useContext(UrlProviderContext);

	const router = useRouter();

	const { cluster } = router.query;

	const [selectedCluster, setSelectedCluster] = useState(cluster);

	useEffect(() => {
		setSelectedCluster(cluster);
	}, [cluster]);

	const handleClusterSwitch = (event) => {
		setSelectedCluster(event.target.value);

		const clusterSwitch = urlProvider.buildCurrentUrl(event.target.value);
		router.push(clusterSwitch);

		toast.info(`Network updated to ${event.target.value}`);
	};

	const popupContent = (
		<Pane width={220} height={220} padding={20} display="flex" flexDirection="column">
			<h6>Settings</h6>
			<RadioGroup
				label="Clusters"
				size={16}
				value={selectedCluster as string}
				options={clusters}
				onChange={handleClusterSwitch}
				marginTop={20}
				className={styles.radiogroup}
			/>
		</Pane>
	);

	return (
		<>
			<Popover bringFocusInside content={popupContent}>
				<div className={cn(styles.wrapper, className)}>
					<SettingsIcon />
				</div>
			</Popover>
		</>
	);
};

export default ClusterSelector;
