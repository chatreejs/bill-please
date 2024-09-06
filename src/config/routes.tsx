import { Navigate, Route, Routes } from 'react-router-dom';

import { BillItemMapping, Home, Result } from '@views';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/mapping" element={<BillItemMapping />} />
      <Route path="/result" element={<Result />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
