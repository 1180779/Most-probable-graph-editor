import React, { useState } from 'react';
import './MenuBar.css';

export interface MenuItem {
    label: string;
    action?: () => void;
    subOptions?: MenuItem[];
    disabled?: boolean;
}

export interface MenuBarItem {
    label: string;
    options: MenuItem[];
}

interface MenuBarProps {
    items: MenuBarItem[];
}

const DropdownOption: React.FC<{ option: MenuItem; onSelect: (option: MenuItem) => void }> = ({ option, onSelect }) => {
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

    return (
        <li
            className={`dropdown-item ${option.disabled ? 'disabled' : ''}`}
            onMouseEnter={() => option.subOptions && setIsSubMenuOpen(true)}
            onMouseLeave={() => option.subOptions && setIsSubMenuOpen(false)}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(option);
            }}
        >
            {option.label}
            {option.subOptions && <span className="submenu-arrow">▶</span>}
            {isSubMenuOpen && option.subOptions && (
                <ul className="dropdown-menu submenu">
                    {option.subOptions.map((subOption, subIndex) => (
                        <DropdownOption key={subIndex} option={subOption} onSelect={onSelect} />
                    ))}
                </ul>
            )}
        </li>
    );
};


const MenuBar: React.FC<MenuBarProps> = ({ items }) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const handleOptionSelect = (option: MenuItem) => {
        if (option.action && !option.disabled) {
            option.action();
            setActiveMenu(null); // Close all menus after action
        }
    };

    return (
        <nav className="menu-bar">
            {items.map(item => (
                <div
                    key={item.label}
                    className="menu-item"
                    onMouseEnter={() => setActiveMenu(item.label)}
                    onMouseLeave={() => setActiveMenu(null)}
                >
                    <span className="menu-label">{item.label}</span>
                    {activeMenu === item.label && (
                        <ul className="dropdown-menu">
                            {item.options.map((option, index) => (
                                <DropdownOption key={index} option={option} onSelect={handleOptionSelect} />
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default MenuBar;
