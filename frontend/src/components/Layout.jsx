import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Toast from './Toast'

export default function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '76px', minHeight: '100vh' }}>
        <Outlet />
      </main>
      <Toast />
    </>
  )
}
