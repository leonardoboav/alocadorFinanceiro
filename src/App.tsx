import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './components/Layout'
import Dashboard from './pages/app/Dashboard'
import Alocacao from './pages/app/Alocacao'
import Aportes from './pages/app/Aportes'
import Carteira from './pages/app/Carteira'
import Backup from './pages/app/Backup'
import Configuracoes from './pages/app/Configuracoes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="carteira" element={<Carteira />} />
          <Route path="alocacao" element={<Alocacao />} />
          <Route path="aportes" element={<Aportes />} />
          <Route path="backup" element={<Backup />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
