
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import About from '../pages/About';

const routes = [
	{
		path: '/login',
		component: Login,
		isPrivate: false,
	},
	{
		path: '/',
		component: Dashboard,
		isPrivate: true,
	},
	{
		path: 'about',
		component: About,
		isPrivate: false,
	},

	{
		path: '/*',
		component: NotFound,
		isPrivate: true,
	},
];

export default routes;
