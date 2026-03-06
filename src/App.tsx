import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TransactionsProvider } from './context/TransactionsContext';
import { TransactionEditorProvider } from './context/TransactionEditorContext';
import { TabLayout } from './components/TabLayout';
import { Home } from './pages/Home';
import { Insights } from './pages/Insights';
import { History } from './pages/History';
import { Categories } from './pages/Categories';

function App() {
  return (
    <BrowserRouter>
      <TransactionsProvider>
        <TransactionEditorProvider>
          <TabLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/history" element={<History />} />
              <Route path="/categories" element={<Categories />} />
            </Routes>
          </TabLayout>
        </TransactionEditorProvider>
      </TransactionsProvider>
    </BrowserRouter>
  );
}

export default App;
