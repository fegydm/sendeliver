import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './components/HomePage';
import SenderPage from './components/SenderPage';
import HaulerPage from './components/HaulerPage';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/sender" component={SenderPage} />
        <Route path="/hauler" component={HaulerPage} />
      </Switch>
    </Router>
  );
}

export default App;
