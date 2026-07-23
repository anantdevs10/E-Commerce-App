import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Catalogue from "./pages/Catalogue";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
// React router watches the url

function App(){

return(

<BrowserRouter>

<Routes>

<Route path="/" element={<Login />} />

<Route path="/catalogue" element={<Catalogue />} />

<Route path="/register" element={<Register />} />

<Route path="/cart" element={<Cart />} />

<Route path="/product/:id" element={<ProductDetail />} />

</Routes>

</BrowserRouter>

);

}

export default App;