import { Link } from 'react-router-dom';
import Header from '../components/Header';

function Signup() {
  return (
    <div className="public-shell">
      <Header />
      <main className="public-page">
        <div className="signup-card">
          <div>
            <p className="eyebrow">Request Access</p>
            <h1>Request Access</h1>
            <p className="muted">
              Contact CodeMachine to onboard your organization.
            </p>
          </div>

          <form className="form signup-form">
            <label className="form__label">
              <span>Work email</span>
              <input className="form__input" type="email" placeholder="you@company.com" required />
            </label>
            <label className="form__label">
              <span>Company</span>
              <input className="form__input" type="text" placeholder="CodeMachine" />
            </label>
            <button className="primary-button" type="button">
              Request onboarding
            </button>
          </form>

          <div className="helper-text">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </main>
      <footer className="site-footer">
        <Link className="muted" to="/provider/login">
          Provider Login
        </Link>
      </footer>
    </div>
  );
}

export default Signup;
