import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './components/HomePage';
import SenderPage from './components/SenderPage';
import HaulerPage from './components/HaulerPage';

function App() {
  const domain = window.location.hostname;

  return (
    <Router>
      <Switch>
        {domain.includes('sender') ? (
          <Route exact path="/" component={SenderPage} /> 
        ) : domain.includes('hauler') ? (
          <Route exact path="/" component={HaulerPage} />
        ) : (
          <>
            <Route exact path="/" component={HomePage} />
            <Route path="/sender" component={SenderPage} />
            <Route path="/hauler" component={HaulerPage} />
          </>
        )}
      </Switch>
    </Router>
  );
}

export default App;
