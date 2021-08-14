import './App.css';
import { BrowserRouter as Router,Route, Switch, Link } from 'react-router-dom';
import routes from './config/routes.js';
import { AuthProvider } from './context';
import AppRoute from './components/AppRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Products from './pages/Products';

// import MainLayout from './components/Layout/MainLayout'
// import { LoginForm } from './components'
function App() {

  return (
  <AuthProvider>
			<Router>
			         
        <Switch>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route path="/products">
            <Products />
          </Route>
          <Route path="/">
            <Dashboard />
          </Route>
        </Switch>*
				{/* 	<Switch>
					{routes.map((route) => {
            console.log('route', route)
            return (
					<AppRoute
							key={route.path}
							path={route.path}
							component={route.component}
							isPrivate={route.isPrivate}
						/>
   
					)})}
				</Switch>  */}
			</Router>
		</AuthProvider>
  )
}
export default App;
