import React from 'react';
import { Form, Input, Button, message } from 'antd'
import {
  useHistory
} from "react-router-dom";
import { loginUser, useAuthState, useAuthDispatch } from '../../context';
import styles from './login.module.css';

function Login(props) {
  console.log('LoginForm render...')

  const dispatch = useAuthDispatch();
  let history = useHistory();
  // const { loading, errorMessage } = useAuthState();

  const onFinish = async (values) => {
        try {
			let response = await loginUser(dispatch, values);
			if (!response.user) return;
			history.push('/');
            // //send register data to API
            // const { data } = await axios.post('auth/login?role=admin', values)

            // if(data?.accessToken){
            //   login(data.accessToken, data.user)
            //   message.success('Login is successful')
            // }else{
            //   message.error('Email or password is wrong.')
            // }
        } catch (error){
            console.log('Login', error)
            message.error(error.message)
        }
    }
    
    const onFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo);
    }
    
    return (
    <div className="mt-32 mx-auto shadow bg-white px-12 pt-12 pb-8" style={{maxWidth: '420px'}}>
    
    <h1 className="text-2xl">Login to Hape Administrator</h1>
    <div className="mt-10">

    <Form
        name="basic"

        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input />
        </Form.Item>
  
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>
        <div className="mt-5">
        <Form.Item >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item></div>
      </Form>
    </div>
    
    </div>
    )
}

export default Login;
