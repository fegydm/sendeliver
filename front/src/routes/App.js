import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './components/HomePage';
import SenderPage from './components/SenderPage';
import HaulerPage from './components/HaulerPage';

function App() {
  return (
    <Router>
      <Switch>
        {/* Hlavná stránka */}
        <Route exact path="/" component={HomePage} />
        
        {/* Podstránky pre sender a hauler */}
        <Route path="/sender" component={SenderPage} />
        <Route path="/hauler" component={HaulerPage} />

        {/* Prípadná podpora pre subdomény */}
        <Route path="*.sender.sendeliver.com" component={SenderPage} />
        <Route path="*.hauler.sendeliver.com" component={HaulerPage} />
      </Switch>
    </Router>
  );
}

export default App;
