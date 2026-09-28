import { Copyright } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <img src="/cart.svg" alt="ShopCart" className="w-6 h-6" />
            <span className="text-lg font-bold">
              Shop<span className="text-purple-400">Cart</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Copyright size={16} />
            <span>{currentYear} ShopCart. All rights reserved.</span>
          </div>

          <div className="text-gray-400 text-sm">
            <p>
              Developed by{" "}
              <span className="text-white font-medium">Aakash Patil</span>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <p className="text-center text-gray-500 text-xs">
            ShopCart &mdash; Your favorite online shopping destination
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

