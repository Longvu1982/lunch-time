import SignIn from "./pages/SignIn";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomeLayout from "./pages/HomeLayout";
import CreateGroup from "./pages/CreateGroups";
import Groups from "./pages/Groups";
import GroupCalendar from "./pages/GroupCalendar";
import PollDetails from "./pages/PollDetails";

function App() {
    const [currentUser] = useAuthState(auth);

    useEffect(() => {
        if (!currentUser?.uid) {
            return;
        }
        const userDocRef = doc(db, "users", currentUser.uid);

        // Function to update user presence status
        const updateStatus = async () => {
            try {
                await updateDoc(userDocRef, {
                    status: "online",
                });
            } catch (error) {
                console.error("Error updating user presence:", error);
            }
        };

        const updateStatusBeforeUnload = async () => {
            try {
                await updateDoc(userDocRef, {
                    status: "offline",
                });
            } catch (error) {
                console.error("Error updating user presence:", error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                updateStatus();
                window.addEventListener("beforeunload", updateStatusBeforeUnload);
            } else {
                // User is signed out
                try {
                    updateDoc(userDocRef, {
                        status: "offline",
                    });
                } catch (error) {
                    console.error("Error updating user presence:", error);
                }
            }
        });

        return () => {
            // Clean up the subscription when the component unmounts
            unsubscribe();
        };
    }, [currentUser]);

    return (
        <>
            <ToastContainer autoClose={800} className="text-sm" />
            <BrowserRouter>
                <Routes>
                    {currentUser ? (
                        <>
                            <Route path="/" element={<HomeLayout />}>
                                <Route index element={<Groups />}></Route>
                                <Route path="group/:groupId" element={<GroupCalendar />} />
                                <Route path="group/:groupId/poll/:pollId" element={<PollDetails />} />
                                <Route path="create-group" element={<CreateGroup />} />
                                <Route path="create-poll" element={<PollDetails />} />
                            </Route>

                            <Route path="/ha-ha" element={<div>HAha</div>} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                        <>
                            <Route path="sign-in" element={<SignIn />} />
                            <Route path="*" element={<Navigate to="/sign-in" />} />
                        </>
                    )}
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
