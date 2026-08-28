import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip automatically after 5 seconds
    const timer = setTimeout(() => {
      setShowTooltip(true);
      // Hide tooltip after 10 seconds of showing it
      setTimeout(() => setShowTooltip(false), 10000);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const whatsappNumber = "919899818720"; // GrahGanit WhatsApp Support Number
  const defaultMessage = "Hello GrahGanit, I would like to book a consultation.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end flex-col gap-4">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white text-black p-4 rounded-2xl shadow-xl max-w-[250px] relative origin-bottom-right"
          >
            <button 
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-black/50 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-sm font-medium pr-4">
              Need guidance? Chat with GrahGanit's team on WhatsApp.
            </p>
            {/* Chat bubble tail */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="w-16 h-16 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all hover:scale-110 active:scale-95"
      >
        <MessageCircle className="w-8 h-8" />
      </a>
    </div>
  );
}
