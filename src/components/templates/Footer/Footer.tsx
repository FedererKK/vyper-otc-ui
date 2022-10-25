import styles from './Footer.module.scss';

const Footer = () => {
	return (
		<footer className={styles.footer}>
			<div>Vyper OTC application built on Vyper Core | Copyright ©{new Date().getFullYear()}</div>
		</footer>
	);
};

export default Footer;
