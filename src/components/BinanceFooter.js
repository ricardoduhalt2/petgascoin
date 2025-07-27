import React from 'react';
import Link from 'next/link';
import { FaTwitter, FaTelegram, FaGithub, FaMedium, FaDiscord } from 'react-icons/fa';

const BinanceFooter = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    {
      name: 'Twitter',
      icon: <FaTwitter className="w-5 h-5" />,
      href: 'https://twitter.com/petgascoin',
    },
    {
      name: 'Telegram',
      icon: <FaTelegram className="w-5 h-5" />,
      href: 'https://t.me/petgascoin',
    },
    {
      name: 'GitHub',
      icon: <FaGithub className="w-5 h-5" />,
      href: 'https://github.com/petgascoin',
    },
    {
      name: 'Medium',
      icon: <FaMedium className="w-5 h-5" />,
      href: 'https://medium.com/petgascoin',
    },
    {
      name: 'Discord',
      icon: <FaDiscord className="w-5 h-5" />,
      href: 'https://discord.gg/petgascoin',
    },
  ];

  const footerLinks = [
    {
      title: 'Products',
      links: [
        { name: 'Exchange', href: '/exchange' },
        { name: 'Academy', href: '/academy' },
        { name: 'Live', href: '/live' },
        { name: 'Launchpad', href: '/launchpad' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'Download', href: '/download' },
        { name: 'Desktop Application', href: '/desktop' },
        { name: 'Institutional', href: '/institutional' },
        { name: 'OTC Trading', href: '/otc' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Request a Feature', href: '/feature-request' },
        { name: 'Support Center', href: '/support' },
        { name: 'Fees', href: '/fees' },
        { name: 'API', href: '/api' },
      ],
    },
    {
      title: 'About',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Terms of Use', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900/80 border-t border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative w-10 h-10">
                <img
                  src="/images/logo.png"
                  alt="PetgasCoin"
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                PetgasCoin
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              The world's leading cryptocurrency exchange. Trade Bitcoin, Ethereum, PGC and other altcoins with low fees and high liquidity.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-medium mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-yellow-500 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
              © {currentYear} PetgasCoin. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-400 hover:text-yellow-500 text-sm transition-colors duration-200">
                Terms of Use
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-yellow-500 text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/risk" className="text-gray-400 hover:text-yellow-500 text-sm transition-colors duration-200">
                Risk Warning
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BinanceFooter;
