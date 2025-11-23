import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { EC2Calculator } from './pages/EC2Calculator';
import { RDSCalculator } from './pages/RDSCalculator';
import { SnapshotCalculator } from './pages/SnapshotCalculator';
import { ReservedInstanceComparison } from './pages/ReservedInstanceComparison';
import { MultiRegionComparison } from './pages/MultiRegionComparison';
import { InstanceSearch } from './pages/InstanceSearch';
import { Optimization } from './pages/Optimization';
import { SavedConfigurations } from './pages/SavedConfigurations';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="ec2" element={<EC2Calculator />} />
            <Route path="rds" element={<RDSCalculator />} />
            <Route path="snapshots" element={<SnapshotCalculator />} />
            <Route path="reserved-instances" element={<ReservedInstanceComparison />} />
            <Route path="multi-region" element={<MultiRegionComparison />} />
            <Route path="search" element={<InstanceSearch />} />
            <Route path="optimization" element={<Optimization />} />
            <Route path="saved" element={<SavedConfigurations />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
