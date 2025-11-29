import React from 'react';
import { Mail, Phone, MapPin, Twitter, Linkedin, Github, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-16 border-t border-[#1c2740]"
      style={{ backgroundColor: "#0f1827", color: "#d7dce6" }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold text-lg">
                VA
              </div>
              <div>
                <h3 className="text-white text-lg leading-tight">Voice AI Platform</h3>
                <p className="text-slate-400 text-sm leading-tight">Conversational Intelligence</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Build intelligent voice agents that sound human. Scale your customer service, sales, and support with AI-powered voice
              technology.
            </p>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href="mailto:support@voiceai.com" className="hover:text-white transition-colors">
                  support@voiceai.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href="tel:+1-800-123-4567" className="hover:text-white transition-colors">
                  +1 (800) 123-4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>123 AI Street, San Francisco, CA 94105</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-semibold tracking-wide uppercase">Product</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Voice Agents</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-semibold tracking-wide uppercase">Resources</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-semibold tracking-wide uppercase">Company</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1c2740] pt-10 space-y-8">
          {/* Social Links */}
          <div className="flex justify-start gap-4">
            {[
              { icon: <Twitter className="w-5 h-5" />, label: "Twitter" },
              { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn" },
              { icon: <Github className="w-5 h-5" />, label: "GitHub" },
              { icon: <Facebook className="w-5 h-5" />, label: "Facebook" },
              { icon: <Instagram className="w-5 h-5" />, label: "Instagram" },
            ].map((item, idx) => (
              <a
                key={idx}
                href="#"
                aria-label={item.label}
                className="w-11 h-11 rounded-lg bg-[#111d30] text-slate-300 flex items-center justify-center hover:text-white hover:bg-[#1b2a45] transition-colors"
              >
                {item.icon}
              </a>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-300">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-slate-400 text-sm">© {currentYear} Voice AI Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
