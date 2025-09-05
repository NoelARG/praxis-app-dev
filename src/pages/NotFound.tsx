
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="h-screen bg-zinc-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex-shrink-0 bg-zinc-900">
        <h1 className="text-2xl font-medium title-gradient">404</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-6 min-h-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-zinc-100">404</h1>
          <p className="text-xl text-zinc-300 mb-4">Oops! Page not found</p>
          <a href="/" className="text-zinc-400 hover:text-zinc-300 underline">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
