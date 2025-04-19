// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ScheduledPosts from './components/ScheduledPosts';
import CronScheduler from './components/CronScheduler';
import PostDetails from './components/PostDetails';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#1d9bf0',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/scheduled" element={<ScheduledPosts />} />
          <Route path="/recurring" element={<CronScheduler />} />
          <Route path="/posts/:id" element={<PostDetails />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;