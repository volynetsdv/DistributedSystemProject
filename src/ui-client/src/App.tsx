import { CustomerList } from './features/customers/CustomerList';
import { ContentList } from './features/content/ContentList';
import './App.scss';

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>CMS Distributed System</h1>
      </header>

      <main className="app-main">
        <h2>Node Monitoring</h2>
        <CustomerList />

        <h2 style={{ marginTop: '2rem' }}>Content Management</h2>
        <ContentList />
      </main>

      <footer>
        Distributed Content Management System Lab
      </footer>
    </div>
  );
}

export default App;
