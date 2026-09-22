import React from "react";
import { Link } from "react-router-dom";
import { Brain, Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";

export default function SmaiFooter() {
  return (
    <footer className="bg-stone-950 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center">
                <Brain className="w-5 h-5 text-stone-950" />
              </div>
              <div className="leading-none">
                <div className="text-[10px] font-bold tracking-[0.18em] text-amber-500 uppercase">Strategic Minds</div>
                <div className="text-sm font-bold text-white tracking-tight">AI Advisory</div>
              </div>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md">
              We help businesses harness AI for consulting, marketing, and custom software — turning emerging
              technology into measurable competitive advantage.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 rounded-lg border border-stone-700 flex items-center justify-center text-stone-400 hover:text-amber-400 hover:border-amber-500 transition">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg border border-stone-700 flex items-center justify-center text-stone-400 hover:text-amber-400 hover:border-amber-500 transition">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.14em] uppercase text-stone-500 mb-4">Navigate</h4>
            <ul className="space-y-2.5">
              <li><Link to="/smai" className="text-sm text-stone-400 hover:text-amber-400 transition">Home</Link></li>
              <li><Link to="/smai/services" className="text-sm text-stone-400 hover:text-amber-400 transition">Services</Link></li>
              <li><Link to="/smai/about" className="text-sm text-stone-400 hover:text-amber-400 transition">About</Link></li>
              <li><Link to="/smai/case-studies" className="text-sm text-stone-400 hover:text-amber-400 transition">Case Studies</Link></li>
              <li><Link to="/smai/contact" className="text-sm text-stone-400 hover:text-amber-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.14em] uppercase text-stone-500 mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="mailto:hello@strategicmindsai.com" className="hover:text-amber-400 transition">hello@strategicmindsai.com</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>(888) 555-0142</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Vero Beach, FL</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">© {new Date().getFullYear()} Strategic Minds AI Advisory. All rights reserved.</p>
          <p className="text-xs text-stone-600">strategicmindsai.com</p>
        </div>
      </div>
    </footer>
  );
}