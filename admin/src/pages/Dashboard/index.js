import React from 'react';
import styles from './dashboard.module.css';
import Layout from '../../components/Layout'
function Dashboard(props) {

	return (
		<Layout {...props}>
		<div style={{ padding: 10 }}>
			<div className={styles.dashboardPage}>
				<h1>Dashboard</h1>
		
			</div>
		
		</div>
		</Layout>
	);
}

export default Dashboard;
