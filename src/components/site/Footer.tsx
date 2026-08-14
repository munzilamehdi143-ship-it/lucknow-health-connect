import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="text-lg">LucknowCare</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            A healthcare aggregator for Lucknow, Uttar Pradesh. Hospital information is
            published only from official hospital sources and administrator verification.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Platform</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>
              <Link to="/hospitals">Hospital directory</Link>
            </li>
            <li>
              <Link to="/compare">Compare hospitals</Link>
            </li>
            <li>
              <Link to="/register-hospital">Register your hospital</Link>
            </li>
          </ul>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Data policy</p>
          <p className="mt-2">
            We never publish invented doctors, fees, ratings or appointment slots.
            Unverified records are labelled as such until an authorised administrator or
            official source confirms them.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LucknowCare · Lucknow, Uttar Pradesh
      </div>
    </footer>
  );
}