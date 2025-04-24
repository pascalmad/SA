// src/app/components/Dropdown.tsx
"use client"; // Add this directive for client-side interactivity (useState, useEffect)

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react'; // Optional: add an icon

// Define the structure for each dropdown item
interface DropdownItem {
  label: string;
  href: string;
}

// Define the props for the Dropdown component
interface DropdownProps {
  triggerText: string;
  items: DropdownItem[];
}

const Dropdown: React.FC<DropdownProps> = ({ triggerText, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref to the dropdown container

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the dropdownRef element
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Add event listener when the dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // Remove event listener when closed (important for performance)
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function to remove listener when component unmounts or isOpen changes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); // Re-run effect only when isOpen changes

  // Close dropdown when an item link is clicked
  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors"
        id="options-menu"
        aria-haspopup="true"
        aria-expanded={isOpen} // Dynamically set aria-expanded
      >
        {triggerText}
        <ChevronDown
          className={`ml-2 -mr-1 h-5 w-5 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-30" // Ensure z-index is high enough
          role="menu" // Use role="menu" for semantic grouping
          aria-orientation="vertical"
          aria-labelledby="options-menu" // Links button to menu for screen readers
        >
          <div className="py-1" role="none">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleItemClick} // Close dropdown on link click
                className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white rounded-md mx-1 my-0.5 transition-colors"
                role="menuitem" // Define items as menu items
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;