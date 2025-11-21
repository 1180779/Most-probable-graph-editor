import React, {useEffect, useRef, useState} from 'react';
import './ContextMenu.css';

export interface MenuOption {
    label: string;
    action?: () => void;
    subOptions?: MenuOption[];
}

interface ContextMenuProps {
    x: number;
    y: number;
    options: MenuOption[];
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({x, y, options, onClose}) => {
    const menuRef = useRef<HTMLUListElement>(null);
    const [activeSubMenu, setActiveSubMenu] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleOptionMouseEnter = (index: number) => {
        if (options[index].subOptions) {
            setActiveSubMenu(index);
        } else {
            setActiveSubMenu(null);
        }
    };

    return (
        <ul
            className="context-menu"
            style={{top: y, left: x}}
            ref={menuRef}
            onMouseLeave={() => setActiveSubMenu(null)}
        >
            {options.map((option, index) => (
                <li
                    key={index}
                    onMouseEnter={() => handleOptionMouseEnter(index)}
                    onClick={() => {
                        if (option.action) {
                            option.action();
                            onClose();
                        }
                    }}
                >
                    {option.label}
                    {option.subOptions && <span className="submenu-arrow">▶</span>}
                    {activeSubMenu === index && option.subOptions && (
                        <ul className="context-menu submenu">
                            {option.subOptions.map((subOption, subIndex) => (
                                <li
                                    key={subIndex}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent parent li's onClick
                                        if (subOption.action) {
                                            subOption.action();
                                            onClose();
                                        }
                                    }}
                                >
                                    {subOption.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default ContextMenu;
