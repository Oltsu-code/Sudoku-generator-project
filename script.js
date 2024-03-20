let latestGrid = [];

function generatePartialGrid(difficulty) {
    const grid = generateEmptyGrid();
    fillGrid(grid);
    removeCells(grid, difficulty);
    latestGrid = grid;
    return grid;
}

function generateEmptyGrid() {
    return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
}

function fillGrid(grid) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                shuffleArray(numbers);
                let validNumber = false;
                for (const num of numbers) {
                    if (isValidPlacement(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (fillGrid(grid)) {
                            validNumber = true;
                            break;
                        } else {
                            grid[row][col] = 0;
                        }
                    }
                }
                if (!validNumber) {
                    return false;
                }
            }
        }
    }
    return true;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function isValidPlacement(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) {
            return false;
        }
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            if (grid[i][j] === num) {
                return false;
            }
        }
    }

    return true;
}

function removeCells(grid, difficulty) {
    const difficultyLevels = {
        easy: { cellsToRemove: 40 },
        medium: { cellsToRemove: 50 },
        hard: { cellsToRemove: 60 }
    };

    const { cellsToRemove } = difficultyLevels[difficulty];

    let cellsRemoved = 0;
    while (cellsRemoved < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (grid[row][col] !== 0) {
            grid[row][col] = 0;
            cellsRemoved++;
        }
    }
}

function generateSudokuGrid(grid) {
    const sudokuGrid = document.getElementById('sudoku-grid');
    sudokuGrid.innerHTML = '';

    if (Array.isArray(grid) && grid.length === 9) {
        for (let i = 0; i < 9; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('row');

            for (let j = 0; j < 9; j++) {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');
                cellDiv.textContent = grid[i][j] !== 0 ? grid[i][j] : '';
                rowDiv.appendChild(cellDiv);
            }

            sudokuGrid.appendChild(rowDiv);
        }
    } else {
        console.error('CRITICAL ERROR: Invalid grid');
    }
}

async function downloadPDF(grid, difficulty) {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const fontSize = 40;
    const cellSize = 40;
    const gridWidth = cellSize * 9;
    const gridHeight = cellSize * 9;

    const centerX = page.getWidth() / 2;
    const centerY = page.getHeight() / 2;

    const headerText = `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)} Sudoku`;
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const titleWidth = font.widthOfTextAtSize(headerText, fontSize);
    const titleX = centerX - titleWidth / 2;
    const titleY = centerY + gridHeight / 2 + fontSize * 1.5;

    page.drawText(headerText, {
        x: titleX,
        y: titleY,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
        textAlign: 'center',
    });

    const gridX = centerX - gridWidth / 2;
    const gridY = centerY - gridHeight / 2;

    grid.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
            const x = gridX + colIndex * cellSize;
            const y = gridY + (8 - rowIndex) * cellSize;

            page.drawRectangle({
                x,
                y,
                width: cellSize,
                height: cellSize,
                color: rgb(1, 1, 1),
                borderColor: rgb(0, 0, 0), 
                borderWidth: 1,
            });

            if (cellValue !== 0) {
                const textX = x + cellSize / 2;
                const textY = y + cellSize / 2 - fontSize / 2;

                page.drawText(cellValue.toString(), {
                    x: textX,
                    y: textY,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                    textAlign: 'center',
                });
            }
        });
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${difficulty}_sudoku.pdf`;
    link.click();
    //alert('Download started!');
    
    console.log(`Latest grid: ${grid}`);
}

document.getElementById('generate-button').addEventListener('click', function() {
    const difficulty = document.getElementById('difficulty').value;
    const grid = generatePartialGrid(difficulty);
    generateSudokuGrid(grid);
});

document.getElementById('download-button').addEventListener('click', function() {
    const difficulty = document.getElementById('difficulty').value;
    //const grid = latestGrid;
    //downloadPDF(grid, difficulty);
});
