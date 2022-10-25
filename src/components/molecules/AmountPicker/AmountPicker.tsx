import { TextInputField, Button } from 'evergreen-ui';

import styles from './AmountPicker.module.scss';

type AmountPickerInput = {
	// title of input component
	title: string;

	// current input value
	value: number;

	// on change callback, will return the provided number
	// eslint-disable-next-line no-unused-vars
	onChange: (_: number) => void;

	// reset value
	resetValue?: number;

	// values for increment buttons
	incrementValues?: [number, number];
};

const getDisplayString = (value: number): string => {
	const baseString = Math.abs(value).toString();
	if (value >= 0) {
		return `+ ${baseString}`;
	} else {
		return `- ${baseString}`;
	}
};

const AmountPicker = ({ title, value, onChange, resetValue, incrementValues }: AmountPickerInput) => {
	resetValue = resetValue ?? 100;
	incrementValues = incrementValues ?? [100, -100];

	return (
		<div className={styles.wrapper}>
			<TextInputField
				label={title}
				type="number"
				value={value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					return onChange(Number(e.target.value));
				}}
			/>
			<Button
				onClick={() => {
					return onChange(resetValue);
				}}
			>
				reset
			</Button>
			<Button
				onClick={() => {
					return onChange(value + incrementValues[0]);
				}}
			>
				{getDisplayString(incrementValues[0])}
			</Button>
			<Button
				onClick={() => {
					return onChange(value + incrementValues[1]);
				}}
			>
				{getDisplayString(incrementValues[1])}
			</Button>
		</div>
	);
};

export default AmountPicker;
