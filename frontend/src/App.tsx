import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
};

export default App;
