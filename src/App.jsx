import { AuthProvider } from "./context/AuthContext";
import LoginButton from "./components/LoginButton";
import EpisodeCombis from "./components/EpisodeCombis";

const SITE_NAME = "CookieRun Guide";
const CHANNEL_NAME = "Soicex";

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <div className="site-header">
          <div>
            <span className="title">{SITE_NAME}</span>
            <span className="subtitle"> โดย {CHANNEL_NAME}</span>
          </div>
          <LoginButton />
        </div>

        <EpisodeCombis />
      </div>
    </AuthProvider>
  );
}
