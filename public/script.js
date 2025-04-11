const gridContainer = document.getElementById("grid-container");

function generateRandomNumber() {
  return Math.floor(Math.random() * 10);
}

function createGrid(rows, cols) {
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
  gridContainer.style.gridTemplateRows = `repeat(${rows}, 50px)`;

  for (let i = 0; i < rows * cols; i++) {
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
    gridItem.textContent = generateRandomNumber();
    gridItem.style.animationDelay = `${Math.random() * 3}s`;
    gridContainer.appendChild(gridItem);
  }
}

createGrid(8, 24);

const kierQuotes = [
  "There is no higher calling than the work before you.",
  "Do not lose sight of yourself in the fog of aimless thought.",
  "Your work is not just your duty—it is your salvation.",
  "A steady mind brings steady hands.",
  "To shirk one's duty is to rob the world of its due.",
  "Idleness is the mold in which lesser men are cast.",
  "The mind that wanders is a garden left untended.",
  "He who spares a second, spares a purpose.",
  "Distraction is the first betrayal.",
  "A man with no task is a man with no worth.",
  "The key to the mountain is the willingness to climb.",
  "The world is a machine. Be a cog that turns, not one that rusts.",
  "A laborer with doubt in his heart holds a broken tool.",
  "The river does not question its course, nor should you.",
  "Only in sweat is the soul made whole."
];

function displayRandomQuote() {
  const quoteText = document.getElementById("quote-text");
  const randomIndex = Math.floor(Math.random() * kierQuotes.length);
  quoteText.textContent = `"${kierQuotes[randomIndex]}"`;
}

displayRandomQuote();