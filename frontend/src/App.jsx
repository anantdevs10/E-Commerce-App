import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Catalogue from "./pages/Catalogue";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Navbar from "./components/Navbar.jsx";

function Layout({ children }) {
    return (
        <div className="min-h-screen bg-paper font-body">
            <Navbar />
            {children}
        </div>
    );
}

function App(){

return(

<BrowserRouter>

<Routes>

<Route path="/" element={<Login />} />

<Route path="/register" element={<Register />} />

<Route path="/catalogue" element={<Layout><Catalogue /></Layout>} />

<Route path="/cart" element={<Layout><Cart /></Layout>} />

<Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />

</Routes>

</BrowserRouter>

);

}

export default App;