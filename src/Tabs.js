import { Link, Outlet } from "react-router-dom";

function Tabs() {

    return (
        <>
            <nav>
                <Link to="/">Cube</Link> | <Link to="/sphere">Sphere</Link>
            </nav>

            <Outlet />
        </>
    )
}

export default Tabs;
