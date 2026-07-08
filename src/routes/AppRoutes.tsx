import {Routes, Route} from 'react-router-dom';
import Home from '../pages/Home';
import PokemonDetails from '../pages/PokemonDetails';
import Favorites from '../pages/Favorites';
import TeamBuilder from '../pages/TeamBuilder';
import MainLayout from '../layouts/MainLayout';
import NotFound from '../pages/NotFound';
import Compare from '../pages/Compare';

function AppRoutes(){
    return(
        <Routes>
            <Route element={<MainLayout />}>
                <Route path='/' element={<Home />} />
                <Route path="/pokemon/:id" element={<PokemonDetails />} />
                <Route path='/favorites' element={<Favorites />} />
                <Route path='/team' element={<TeamBuilder />} />
                <Route path="/compare/:id1/:id2" element={<Compare />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}

export default AppRoutes;