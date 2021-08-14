import './App.css';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import routes from './config/routes.js';
import { AuthProvider } from './context';
import AppRoute from './components/AppRoute';

// import MainLayout from './components/Layout/MainLayout'
// import { LoginForm } from './components'
function App() {

  return (
  <AuthProvider>
			<Router>
				<Switch>
					{routes.map((route) => (
						<AppRoute
							key={route.path}
							path={route.path}
							component={route.component}
							isPrivate={route.isPrivate}
						/>
					))}
				</Switch>
			</Router>
		</AuthProvider>
  )
}
export default App;
