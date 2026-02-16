import { CustomerList } from './features/customers/CustomerList'
import './App.scss'

function App() {

  return (
    <div className="app-container">
      <header>
        <h1>CMS Distributed System</h1>
      </header>
      
      <main>
        <h2>System state:</h2>
        <CustomerList />
      </main>

      <footer>
        Distributed Content Management System Lab
      </footer>
    </div>
  )
}

export default App
