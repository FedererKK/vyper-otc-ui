import { Button, Heading, WarningSignIcon } from 'evergreen-ui';
import { FallbackProps } from 'react-error-boundary';

import Layout from '../Layout';
import styles from './ApplicationError.module.scss';

const ApplicationError = ({ resetErrorBoundary }: FallbackProps) => {
	return (
		<Layout>
			<div className={styles.container}>
				<div className={styles.title}>
					<WarningSignIcon size={20} />
					<Heading size={800}>Application Error</Heading>
				</div>
				<p>Vyper OTC encountered an application error.</p>
				<Button onClick={resetErrorBoundary}>Try Again</Button>
			</div>
		</Layout>
	);
};

export default ApplicationError;
