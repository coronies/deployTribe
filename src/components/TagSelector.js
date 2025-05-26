import React from 'react';
import '../styles/TagSelector.css';

const TagSelector = ({ options, selected, onChange, multiple = false, max = null }) => {
  const handleTagClick = (tag) => {
    if (multiple) {
      if (selected.includes(tag)) {
        onChange(selected.filter(t => t !== tag));
      } else if (!max || selected.length < max) {
        onChange([...selected, tag]);
      }
    } else {
      onChange(selected === tag ? '' : tag);
    }
  };

  return (
    <div className="tag-selector">
      <div className="tags-grid">
        {options.map(tag => (
          <button
            key={tag}
            type="button"
            className={`tag-button ${multiple ? 
              (selected.includes(tag) ? 'selected' : '') : 
              (selected === tag ? 'selected' : '')
            }`}
            onClick={() => handleTagClick(tag)}
            disabled={multiple && max && selected.length >= max && !selected.includes(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      {multiple && max && (
        <div className="tag-limit-info">
          Selected: {selected.length}/{max}
        </div>
      )}
    </div>
  );
};

export default TagSelector; 