import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import '../styles/TagSelector.css';

const TagSelector = ({ options, selected, onChange, multiple = false, max = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTagClick = (tag) => {
    if (multiple) {
      if (selected.includes(tag)) {
        onChange(selected.filter(t => t !== tag));
      } else {
        if (max && selected.length >= max) {
          return;
        }
        onChange([...selected, tag]);
      }
    } else {
      onChange([tag]);
      setIsOpen(false);
    }
  };

  return (
    <div className="tag-selector" ref={dropdownRef}>
      <div 
        className={`tag-dropdown ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-tags">
          {selected.length > 0 ? (
            <div className="selected-tags-list">
              {selected.map((tag) => (
                <span key={tag} className="selected-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <span className="placeholder">Select tags</span>
          )}
        </div>
        <FiChevronDown className={`dropdown-icon ${isOpen ? 'open' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="tag-options-container">
          <div className="tag-options">
            {options.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-option ${selected.includes(tag) ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagClick(tag);
                }}
                disabled={max && selected.length >= max && !selected.includes(tag)}
              >
                <span className="tag-option-text">{tag}</span>
                {selected.includes(tag) && (
                  <FiCheck className="check-icon" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector; 