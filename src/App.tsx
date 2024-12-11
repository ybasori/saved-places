import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Navbar from "@/components/molecules/Navbar/Navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import "./App.css";
import { GoogleMapsProvider } from "./components/organisms/GoogleMapsProvider/GoogleMapsProvider";

export default function App() {
  return (
    <Provider store={store}>
      <GoogleMapsProvider>
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}
        >
          <Router>
            <Navbar />
            <div className="container">
              <Switch>
                <Route path="/">
                  <Home />
                </Route>
              </Switch>
            </div>
          </Router>
        </GoogleOAuthProvider>
      </GoogleMapsProvider>
    </Provider>
  );
}
