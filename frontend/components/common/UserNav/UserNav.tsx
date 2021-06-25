import { FC, useState } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import s from './UserNav.module.css'
import { Modal, Button } from 'antd';
import { RegisterForm } from '@components/common'
import { useAuth } from '@context/AuthContext'
import { Menu, Dropdown, Icon } from 'antd'
const RegisterModal = () => {
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('Content of the modal');
  const { accessToken, user, logout } = useAuth();
  const showModal = () => {
    setVisible(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setVisible(false);
      setConfirmLoading(false);
    }, 400);
  };

  const handleCancel = () => {
    setVisible(false);
  }

  return (
    <>
      {
        accessToken !== '' ?
          <div className={s.userLoggedBox}>
            <div>Chào, {user.username} 
            <div className={s.dropdown}>
                <ul>
                  <li className={s.dropdownItem}>Tài khoản</li>
                  <li className={s.dropdownItem} onClick={logout}>Đăng xuất</li>
                </ul>
              </div>
            </div>
            
          </div> :
          <><button onClick={showModal} className="button arrow">Đăng ký</button>
            <Modal
              title="Đăng ký thành viên"
              className="register-form-modal"
              visible={visible}
              onOk={handleOk}
              confirmLoading={false}
              onCancel={handleCancel}
              footer={null}
            >
              <RegisterForm />
            </Modal>
          </>
      }
    </>


  )
}


interface Props {
  className?: string
}
const UserNav: FC<Props> = ({ className }) => {

  return (
    <nav className={cn(s.root, className)}>
      <div className={s.mainContainer}>
        <RegisterModal />
      </div>
    </nav>
  )
}

export default UserNav
