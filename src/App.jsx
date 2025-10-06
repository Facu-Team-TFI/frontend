import { ToastContainer } from "react-toastify";
import {
  notifyMissingFields,
  notifySuccessAdd,
} from "./pages/notification/notification";

import { BrowserRouter as Router } from "react-router";

import { AuthProvider } from "./services/auth/AuthContext";
import AppContent from "./AppContent";
import { SearchProvider } from "./services/auth/SearchContext";
import { NotificationsContextProvider } from "./services/notifications/NotificationsContextProvider";

function App() {
  return (
    <AuthProvider>
      <NotificationsContextProvider>
        <SearchProvider>
          <ToastContainer />
          <Router>
            <AppContent />
          </Router>
        </SearchProvider>
      </NotificationsContextProvider>
    </AuthProvider>
  );
}

export default App;
