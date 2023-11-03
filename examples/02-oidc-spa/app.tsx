import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Home from './app/routes/home.tsx';

const rootEl = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootEl);
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
