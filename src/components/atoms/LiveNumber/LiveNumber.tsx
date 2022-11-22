import { Box, Autocomplete, TextField, Grid, Typography, Alert, Fab } from '@mui/material';
import { useEffect, useState } from 'react';

import styles from './LiveNumber.module.scss';

type LiveNumberProps = {
	value: number;
};

const LiveNumber = ({ value }: LiveNumberProps) => {
	const [oldValue, setOldValue] = useState(value);
	const [newValue, setNewValue] = useState(value);
	const [isUp, setIsUp] = useState(false);
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		setNewValue(value);
		if (newValue !== oldValue) {
			setIsUp(newValue > oldValue);
			setOldValue(value);
			setIsActive(true);
			setTimeout(() => {
				setIsActive(false);
			}, 350);
		}
	}, [value, oldValue, newValue]);

	// 	<Typography sx={{ backgroundColor: isUp ? 'green' : 'red', transition: 'all .2s ease', WebkitTransition: 'all .2s ease', MozTransition: 'all .2s ease' }}>
	// </Typography>
	return (
		<div className={styles.container}>
			<div className={isActive ? (isUp ? styles.up : styles.down) : ''}>
				{value}
				{/* {isUp ? 'up' : 'down'} */}
			</div>
		</div>
	);
};

export default LiveNumber;
