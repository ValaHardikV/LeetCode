import { Routes, Route, Navigate } from "react-router";
import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import { checkAuth } from "./authSlice.js"
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import Admin from "./pages/Admin.jsx";
import ProblemPage from "./pages/Problempage.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import AdminDelete from "./components/AdminDelete.jsx";
import AdminVideo from "./components/AdminVideo.jsx"
import AdminUpload from "./components/AdminUpload.jsx"



function App() {

    // when user open website, check is user authicated or not
    // if authocated means login then send this user into homepage or if not then send into signup or login page

    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // exicute only one time so we give constant value in dependency array
    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }


    return (
        <>
            <Routes>
                {/* if user authoticated then direct go home page, other wise go signup page */}
                <Route path="/" element={isAuthenticated ? <Homepage></Homepage> : <Navigate to={"/signup"}></Navigate>}></Route>

                {/* if user authoticated then direct go home page, no need to go login or signup page  */}
                <Route path="/login" element={isAuthenticated ? <Navigate to={"/"}></Navigate> : <Login></Login>}></Route>
                
                <Route path="/signup" element={isAuthenticated ? <Navigate to={"/"}></Navigate> : <Signup></Signup>}></Route>

                {/* only give access to admin for admin dashboard */}
                <Route path="/admin" element={(isAuthenticated && user?.role === "admin") ? <Admin></Admin> : <Navigate to={"/"}></Navigate>}></Route>

                {/* <Route path="/admin" element={(isAuthenticated && user?.role === "admin") ? <AdminPanel></AdminPanel> : <h1>You are Not Admin</h1>}></Route> */}

                {/* create and delete problem */}
                <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />

                <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />

                <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />

                <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />

                {/* admin update functinality not create at */}

                <Route path="/problem/:problemId" element={<ProblemPage></ProblemPage>}></Route>


            </Routes>
        </>
    )
}

export default App;