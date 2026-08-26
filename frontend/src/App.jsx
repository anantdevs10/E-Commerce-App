import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Catalogue from "./pages/Catalogue";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import AddressBook from "./pages/AddressBook";
import Navbar from "./components/Navbar";
import Wishlist from "./pages/WishList";

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

<Route path="/orders" element={<Layout><OrderHistory /></Layout>} />

<Route path="/orders/:id" element={<Layout><OrderDetail /></Layout>} />

<Route path="/profile" element={<Layout><Profile /></Layout>} />

<Route path="/addresses" element={<Layout><AddressBook /></Layout>} />

<Route path="/wishlist" element={<Wishlist />} />

</Routes>

</BrowserRouter>

);

}

export default App;