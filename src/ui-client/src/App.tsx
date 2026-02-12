import { CustomerList } from './features/customers/CustomerList'

function App() {

  return (
    <div className="app-container">
      <header>
        <h1>CMS Distributed System</h1>
      </header>
      
      <main style={{ padding: '2rem' }}>
        <h2>Статус системи:</h2>
        {/* Наш компонент, який сам знає, як завантажити дані через Redux */}
        <CustomerList />
      </main>

      <footer style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#666' }}>
        Distributed Content Management System Lab
      </footer>
    </div>
  )
}

export default App
