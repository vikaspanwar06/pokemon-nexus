import '../styles/navbar.css';
import logo from '../assests/img/logo.png';
import {FaHome, FaStar} from "react-icons/fa";
import { GiBattleGear } from "react-icons/gi";
import { NavLink } from 'react-router-dom';

function Navbar(){
    return(
        <div className='sidebar'>
            <div className='logo'>
                <img src={logo} alt='logo' />
            </div>

            <ul className="nav-menu">
                <li>
                    <NavLink 
                        to="/"
                        end
                        className={({ isActive }) => 
                            isActive ? "nav-item active" : "nav-item"
                        }
                    >
                        <FaHome />
                        <span className='text'>Home</span>  
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/favorites"
                        className={({ isActive }) => 
                            isActive ? "nav-item active" : "nav-item"
                        }
                    >
                        <FaStar />
                        <span className='text'>Favorites</span>  
                    </NavLink>
                </li>
                <li>
                    <NavLink 
                        to="/team"
                        className={({ isActive }) => 
                            isActive ? "nav-item active" : "nav-item"
                        }
                    >
                        <GiBattleGear />
                        <span className='text'>Team Builder</span>  
                    </NavLink>
                </li>
            </ul>
        </div>
    )
}

export default Navbar;