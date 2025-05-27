import React, { useState } from 'react';
import PopupMenu from './components/PopupMenu';
import './Quiz.css';
import axios from 'axios';

function Quiz() {
  const quizzes = [
    "Academic & Professional", "Creative & Arts", "Cultural & Identity",
    "Community Service & Social Impact", "Sports & Recreation", "Technology & Innovation",
    "Social & Special Interests", "Political & Advocacy", "Health & Wellness",
    "STEM - Specific", "Media & Communication", "Environmental & Sustainability"
  ];
  const colors = ["#6FBEBF", "#D32628", "#015464", "#821A0F", "#821A0F", "#015464", "#6FBEBF", "#D32628", "#6FBEBF", "#D32628", "#821A0F", "#015464"];

  const [selections, setSelections] = useState(Array(quizzes.length).fill([])); // Track selected subcategories
  const nothi/ Store backend response

  // Handle selection changes from PopupMenu
  const handleSelectionChange = (index, selectedSubcategories) => {
    const updatedSelections = [...selections];
    updatedSelections[index] = selectedSubcategories;
    setSelections(updatedSelections);
  };

  // Handle form submission
  const handleSubmit = async () => {
    const data = selections.map((subcategories, index) => ({
      generalCategory: quizzes[index],
      subcategories,
    }));

    function hexToRgba(hex, opacity) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/match', {
        answers: data,
      });
      setResult(`Matched Club: ${response.data.match}`);
    } catch (error) {
      console.error("Error submitting quiz data:", error);
      setResult("Error finding a match. Please try again.");
    }
  };

  return (
    <>
      <h1>Select the Categories You Are Interested In:</h1>
      <div className="Quiz">
        {quizzes.map((text, index) => (
          <PopupMenu
            key={index}
            title={text}
            index={index}
            color={colors[index]}
            className="originalButton"
            onSelectionChange={(selectedSubcategories) =>
              handleSelectionChange(index, selectedSubcategories)
            }
          />
        ))}
      </div>
      <button
        className='submitButton'
        style={{ backgroundColor: "#FDD275" }}
        onClick={handleSubmit}
      >
        Submit
      </button>
      {result && <h2>{result}</h2>}
    </>
  );
}

export default Quiz;

