/* eslint-disable no-unused-vars */

import {useAuth} from './hooks/useAuth';
import { AuthProvider } from './context/AuthContext';
import Feed from './components/Feed';
import LoginForm from './components/LoginForm';
import React from 'react';
import { clearAllCaches } from './utils/cacheUtils';

function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
       <Feed/>
      ) : (
        <LoginForm/>
      )}
    </div>
  );
}
function CacheMonitor() {
const {isAuthenticated} = useAuth();

  if(!isAuthenticated) {
    return null;
  }
  const handleClearCache = () => {
    clearAllCaches();
    window.location.reload();
  }
}
function App() {
	return (
		<>
			<AuthProvider>
				<AppRouter />
			</AuthProvider>
		</>
	);
}

export default App;
