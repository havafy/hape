
import axios from "axios"

export async function loginUser(dispatch, loginPayload) {

	try {
		dispatch({ type: 'REQUEST_LOGIN' });
		const { data } = await axios.post('auth/login?role=admin', loginPayload)
 		// if(data?.accessToken){
		// let response = await fetch(`${ROOT_URL}/login`, requestOptions);
		// let data = await response.json();

		if (data.user) {
			dispatch({ type: 'LOGIN_SUCCESS', payload: data });
			localStorage.setItem('currentUser', JSON.stringify(data));
			return data;
		}

		dispatch({ type: 'LOGIN_ERROR', error: data.errors[0] });
		console.log(data.errors[0]);
		return;
	} catch (error) {
		dispatch({ type: 'LOGIN_ERROR', error: error });
		console.log(error);
	}
}

export async function logout(dispatch) {
	dispatch({ type: 'LOGOUT' });
	localStorage.removeItem('currentUser');
	localStorage.removeItem('token');
}
