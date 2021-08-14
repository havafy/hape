import React from 'react';
import styles from './products.module.css';
import Layout from '../../components/Layout'
function Products(props) {

	return (
		<Layout {...props}>
		<div style={{ padding: 10 }}>
			<div className={styles.dashboardPage}>
				<h1>Products</h1>
		
			</div>
		
		</div>
		</Layout>
	);
}

export default Products;
