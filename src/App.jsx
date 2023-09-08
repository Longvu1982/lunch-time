import { getAuth } from "firebase/auth";
import SignIn from "./pages/SignIn";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";


function App() {
  const [user] = useAuthState(auth);
  return (
    <BrowserRouter>
      <Routes>
        {user ? (
          <>
            <Route path="/" element={<SignIn />} />
            <Route path="/ha-ha" element={<div>HAha</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <Route path="sing-in" element={<SignIn />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
