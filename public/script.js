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
          gridContainer.appendChild(gridItem);
        }
      }

      createGrid(10, 29);