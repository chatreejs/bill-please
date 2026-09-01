import { Navigate, Route, Routes } from 'react-router-dom';

import { BillItemMapping, Home, Privacy, Result, Tos } from '@views';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/mapping" element={<BillItemMapping />} />
      <Route path="/result" element={<Result />} />
      <Route path="/tos" element={<Tos />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
