const PLAYER_GRID = 0
const COMPUTER_GRID = 1

const PHASE_SHIPS_PLACEMENT = 0
const PHASE_GAME_PLAYER = 1
const PHASE_GAME_COMPUTER = 2
const PHASE_GAME_ENDED = 3

class Battleship
{
  battleshipElement
  mapSize
  phase
  availableShips
  ships = {
    player: [],
    computer: []
  }
  selectedCell = {
    col: null,
    row: null
  }

  constructor(battleshipId, mapSize, availableShips) {
    this.battleshipElement = document.querySelector(battleshipId)
    this.mapSize = mapSize + 1 //we add 1 because of the row and column headers
    this.availableShips = availableShips

    this.#generateMap()
    this.#setHoverEffects()

    this.setPhase(PHASE_SHIPS_PLACEMENT)

    this.#placeShipsPlayer()

    this.#registerStartEventClick()
  }

  /*
  Generate both grids.
  */
  #generateMap() {
    //Remove eventual previous grids
    document.querySelectorAll('.battleship-grid').forEach(gridElement => {
      gridElement.remove()
    })

    //Create 2 grids (Player & Computer)
    for (let n = 0; n < 2; n++) {
      let battleshipGrid = document.createElement('div')

      battleshipGrid.classList.add('battleship-grid', 'grid')

      //Set who is playing the grid
      switch (n) {
        case 0:
          battleshipGrid.id = "battleship-grid-player"
          break
        
        case 1:
          battleshipGrid.id = "battleship-grid-computer"
          break
      }

      battleshipGrid.style.gridTemplateColumns = 'repeat(' + this.mapSize + ', minmax(0, 1fr))'

      this.battleshipElement.append(battleshipGrid)

      //Create cells for each grid
      for (let i = 0; i < this.mapSize; i++) {
        for (let j = 0; j < this.mapSize; j++) {
          let battleshipCellTemplate = document.createElement('div')
          battleshipCellTemplate.classList.add('font-bold', 'w-10', 'h-10', 'flex', 'justify-center', 'items-center')
          battleshipCellTemplate.dataset.grid = n

          if (i === 0) {
            //Set column header
            battleshipCellTemplate.innerHTML = String.fromCharCode(65 + j - 1)
            battleshipCellTemplate.classList.add('bg-white', 'text-gray-900')
            battleshipCellTemplate.dataset.colHeader = String.fromCharCode(65 + j - 1)
          } else if (j === 0) {
            //Set row header
            battleshipCellTemplate.innerHTML = i
            battleshipCellTemplate.classList.add('bg-white', 'text-gray-900')
            battleshipCellTemplate.dataset.rowHeader = i
          } else {
            battleshipCellTemplate.classList.add('battleship-cell', 'bg-blue-500', 'cursor-pointer')
            battleshipCellTemplate.dataset.col = String.fromCharCode(65 + j - 1)
            battleshipCellTemplate.dataset.row = i
            battleshipCellTemplate.dataset.grid = n
            battleshipCellTemplate.dataset.ship = false
            battleshipCellTemplate.dataset.hit = false
          }

          //If the cell was in the top left corner, we empty it and remove all styles.
          if (i === 0 && j === 0) {
            battleshipCellTemplate.innerHTML = ''
            battleshipCellTemplate.classList.remove('bg-white', 'text-gray-900')
          }

          battleshipGrid.append(battleshipCellTemplate)
        }
      }
    }
  }

  /*
  Remove every ship or hit on the map.
  */
  #cleanMap() {
    this.battleshipElement.querySelectorAll('.battleship-cell').forEach(cell => {
      this.cleanCell(cell.dataset.grid, cell.dataset.col, cell.dataset.row)
    })
  }

  #setHoverEffects() {
    this.cells().forEach(cell => {
      cell.addEventListener('mouseover', event => {
        //Do not apply hover effect on the selected cell
        if (cell.dataset.col != this.selectedCell.col || cell.dataset.row != this.selectedCell.row) {
          this.setCellDarkness(event.target.dataset.grid, event.target.dataset.col, event.target.dataset.row)
        }
 

        //Darken columns & rows header
        this.setCellDarkness(event.target.dataset.grid, event.target.dataset.col, null)
        this.setCellDarkness(event.target.dataset.grid, null, event.target.dataset.row)
      })

      cell.addEventListener('mouseleave', event => {
        //Do not apply hover effect on the selected cell
        if (cell.dataset.col != this.selectedCell.col || cell.dataset.row != this.selectedCell.row) {
          this.setCellDarkness(event.target.dataset.grid, event.target.dataset.col, event.target.dataset.row, false)
        }


        //Reset columns & rows header's darkness
        this.setCellDarkness(event.target.dataset.grid, event.target.dataset.col, null, false)
        this.setCellDarkness(event.target.dataset.grid, null, event.target.dataset.row, false)
    })
    })
  }

  #registerStartEventClick() {
    document.querySelector('#battleship-start-button button').addEventListener('click', event => {
      this.start()
    })
  }

  setCellBackgroundColor(grid, col, row, color) {
    this.resetCellBackgroundColor(grid, col, row)

    let cell = this.cell(grid, col, row)
    cell.classList.add(color)
  }

  resetCellBackgroundColor(grid, col, row) {
    let cell = this.cell(grid, col, row)

    cell.style.backgroundColor = ''

    let classNamesToRemove = []
    cell.classList.forEach(className => {
      if (className.startsWith('bg-') || className.startsWith('text-')) {
        classNamesToRemove.push(className)
      }
    })

    classNamesToRemove.forEach(className => {
      cell.classList.remove(className)
    })

    cell.classList.add('bg-blue-500')
  }

  setCellBackgroundImage(grid, col, row, path, rotation) {
    this.resetCellBackgroundImage(grid, col, row)

    let cell = this.cell(grid, col, row)
    cell.style.backgroundImage = 'url("' + path + '")'
    cell.style.backgroundRepeat = 'no-repeat'
    cell.style.backgroundPosition = 'center'
    cell.style.backgroundSize = 'contain'
    cell.style.transform = 'rotate(' + rotation + 'deg)'
  }

  resetCellBackgroundImage(grid, col, row) {
    let cell = this.cell(grid, col, row)

    cell.style.backgroundImage = ''
  }

  setCellDarkness(grid, col, row, darken = true, darkenCoef = 0.8) {
    let cell = this.cell(grid, col, row)

    let brightness
    if (darken) {
      brightness = darkenCoef
    } else {
      brightness = 1
    }

    cell.style.filter = 'brightness(' + brightness + ')'
  }

  cleanCell(grid, col, row) {
    let cell = this.cell(grid, col, row)

    //Set original content
    cell.innerHTML = ''

    //Set original color
    this.resetCellBackgroundColor(grid, col, row)

    //Remove background properties
    cell.style.backgroundImage = ''
    cell.style.backgroundRepeat = ''
    cell.style.backgroundPosition = ''
    cell.style.backgroundSize = ''
    cell.style.transform = ''

    //Set original data
    cell.dataset.ship = false
    cell.removeAttribute('data-ship-id')
    cell.dataset.hit = false
  }

  setPhase(phase) {
    this.phase = phase
  }

  //Get a cell HTML element in a specific grid by column letter and row number
  cell(grid, col, row) {
    let selector

    if (col === null) {
      selector = '[data-grid="' + grid + '"][data-row-header="' + row + '"]'
    } else if (row === null) {
      selector = '[data-grid="' + grid + '"][data-col-header="' + col + '"]'
    } else if (col !== null && row !== null) {
      selector = '.battleship-cell[data-grid="' + grid + '"][data-col="' + col + '"][data-row="' + row + '"]'
    }

    return this.battleshipElement.querySelector(selector)
  }
  
  //Get all cells HTML elements in a grid
  cells(grid = null) {
    if (grid === PLAYER_GRID || grid === COMPUTER_GRID) {
      return this.battleshipElement.querySelectorAll('.battleship-cell[data-grid="' + grid + '"]')
    } else {
      return this.battleshipElement.querySelectorAll('.battleship-cell')
    }
  }

  cellsWithoutHit(grid = null) {
    if (grid === PLAYER_GRID || grid === COMPUTER_GRID) {
      return this.battleshipElement.querySelectorAll('.battleship-cell[data-grid="' + grid + '"][data-hit="false"]')
    } else {
      return this.battleshipElement.querySelectorAll('.battleship-cell[data-hit="false"]')
    }
  }

  cellsWithHit(grid = null) {
    if (grid === PLAYER_GRID || grid === COMPUTER_GRID) {
      return this.battleshipElement.querySelectorAll('.battleship-cell[data-grid="' + grid + '"][data-hit="true"]')
    } else {
      return this.battleshipElement.querySelectorAll('.battleship-cell[data-hit="true"]')
    }
  }

  setSelectedCell(grid, col, row) {
    if (col !== null && row !== null) {
      this.setCellDarkness(grid, col, row)
    } else {
      this.setCellDarkness(grid, this.selectedCell.col, this.selectedCell.row, false)
    }

    this.selectedCell = {
      grid,
      col,
      row,
    }
  }

  remainingShipsToPlace(grid) {
    switch (grid) {
      case PLAYER_GRID:
        let playerShipIds = []
        this.ships.player.forEach(ship => {
          playerShipIds.push(ship.id)
        })

        let remainingPlayerShips = []
        this.availableShips.forEach(ship => {
          if (!playerShipIds.includes(ship.id)) {
            remainingPlayerShips.push(ship)
          }
        })

        return remainingPlayerShips
      
      case COMPUTER_GRID:
        let computerShipIds = []
        this.ships.computer.forEach(ship => {
          computerShipIds.push(ship.id)
        })

        let remainingComputerShips = []
        this.availableShips.forEach(ship => {
          if (!computerShipIds.includes(ship.id)) {
            remainingComputerShips.push(ship)
          }
        })

        return remainingComputerShips
    }
  }

  getFreePositionsOnMap(grid, ship) {
    let freePositions = []

    for (let column = 1; column <= this.mapSize - 1; column++) {
      for (let row = 1; row <= this.mapSize - 1; row++) {
        //check free positions horizontally
        if (column - 1 + ship.size <= this.mapSize - 1) {
          let consecutiveFreeCells = []
          let metCellNotFree = false
          for (let i = 0; i < ship.size; i++) {
            let cellToCheck = this.cell(grid, String.fromCharCode(64 + column + i), row)
            if (cellToCheck.dataset.ship === 'false') {
              consecutiveFreeCells.push({
                col: String.fromCharCode(64 + column + i),
                row: row
              })
            } else {
              metCellNotFree = true
              break
            }
          }

          if (!metCellNotFree) {
            freePositions.push(consecutiveFreeCells)
          }
        }

        //check free positions vertically
        if (row - 1 + ship.size <= this.mapSize - 1) {
          let consecutiveFreeCells = []
          let metCellNotFree = false
          for (let i = 0; i < ship.size; i++) {
            let cellToCheck = this.cell(grid, String.fromCharCode(64 + column), row + i)
            if (cellToCheck.dataset.ship === 'false') {
              consecutiveFreeCells.push({
                col: String.fromCharCode(64 + column),
                row: row + i
              })
            } else {
              metCellNotFree = true
              break
            }
          }

          if (!metCellNotFree) {
            freePositions.push(consecutiveFreeCells)
          }
        }
      }
    }

    return freePositions
  }

  isShipPositionCorrect(grid, ship) {
    let isCorrect = true
  
    ship.cells.forEach(cell => {
      if (this.battleshipElement.querySelector('.battleship-cell[data-grid="' + grid + '"][data-col="' + cell.col + '"][data-row="' + cell.row + '"]').dataset.ship == 'true') {
        isCorrect = false
        return
      }
    })

    return isCorrect
  }

  #placeShipsPlayer() {
    if (this.phase !== PHASE_SHIPS_PLACEMENT) {
      return
    }

    this.battleshipElement.querySelectorAll('.battleship-cell[data-grid="' + PLAYER_GRID + '"]').forEach(cell => {
      cell.addEventListener('click', event => {
        let remainingShips = this.remainingShipsToPlace(PLAYER_GRID)
        
        if (remainingShips.length === 0) {
          return
        }
      
        if (this.selectedCell.col === null && this.selectedCell.row === null) {
          this.setSelectedCell(PLAYER_GRID, event.target.dataset.col, parseInt(event.target.dataset.row))
        } else {
          let ship = {
            id: remainingShips[0].id,
            cells: []
          }

          if (this.selectedCell.col === event.target.dataset.col) {
            //Then ship must be placed vertically

            //Check if the selected range of cells matches the ship's size
            if (Math.abs(this.selectedCell.row - parseInt(event.target.dataset.row)) + 1 !== remainingShips[0].size) {
              this.setSelectedCell(PLAYER_GRID, null, null)
              this.displayErrorMessage('Vous avez sélectionné un nombre incorrect de cases.')
              return
            }

            //If no ships placed yet, then hide the map size choice just after placing the first ship.
            if (remainingShips.length === this.availableShips.length) {
              Battleship.displayMapSizeChoice(false)
            }

            for (let i = 0; i < remainingShips[0].size; i++) {
              ship.cells.push({
                col: this.selectedCell.col,
                row: Math.min(this.selectedCell.row, parseInt(event.target.dataset.row)) + i
              })
            }

            this.addShip(PLAYER_GRID, ship)
          } else if (this.selectedCell.row === parseInt(event.target.dataset.row)) {
            //Then ship must be placed horizontally

            //Check if the selected range of cells matches the ship's size
            if (Math.abs(this.selectedCell.col.charCodeAt(0) - event.target.dataset.col.charCodeAt(0)) + 1 !== remainingShips[0].size) {
              this.setSelectedCell(PLAYER_GRID, null, null)
              this.displayErrorMessage('Vous avez sélectionné un nombre incorrect de cases.')
              return
            }

            for (let i = 0; i < remainingShips[0].size; i++) {
              ship.cells.push({
                col: String.fromCharCode(Math.min(this.selectedCell.col.charCodeAt(0), event.target.dataset.col.charCodeAt(0)) + i),
                row: this.selectedCell.row
              })
            }

            this.addShip(PLAYER_GRID, ship)            
          } else {
            this.displayErrorMessage('Un bateau ne peut être placé que verticalement ou horizontalement.')
          }

          this.setSelectedCell(PLAYER_GRID, null, null)
        }
      })
    })
  }

  placeShipsComputer() {
    while (true) {
      let remainingShips = this.remainingShipsToPlace(COMPUTER_GRID)
        
      if (remainingShips.length === 0) {
        break
      }
  
      let freePositions = this.getFreePositionsOnMap(COMPUTER_GRID, remainingShips[0])
      let randomFreePosition = freePositions[Math.floor(Math.random() * freePositions.length)]
  
      let ship = {
        id: remainingShips[0].id,
        cells: randomFreePosition
      }

      this.addShip(COMPUTER_GRID, ship)
    }
  }

  addShip(grid, ship) {
    if (this.phase !== PHASE_SHIPS_PLACEMENT) {
      return
    }

    if (!this.isShipPositionCorrect(grid, ship)) {
      return
    }

    switch (grid) {
      case PLAYER_GRID:
        this.ships.player.push(ship)
        this.displayShip(grid, ship)
        this.displayNextShipInformation()
        break
      
      case COMPUTER_GRID:
        this.ships.computer.push(ship)
        //temporary
        //this.displayShip(grid, ship)
        break
    }

    ship.cells.forEach(cell => {
      let cellElement = this.cell(grid, cell.col, cell.row)
      cellElement.dataset.ship = true
      cellElement.dataset.shipId = ship.id
    })
  }

  displayShip(grid, ship) {
    let imagePaths = this.availableShips.find(obj => obj.id === ship.id).imagePaths

    //Check if ship is horizontal
    let rotation = ship.cells[0].row === ship.cells[1].row ? -90 : 0

    for (let i = 0; i < ship.cells.length; i++) {
      this.setCellBackgroundImage(grid, ship.cells[i].col, ship.cells[i].row, imagePaths[i], rotation)
    }
  }

  displayNextShipInformation() {
    if (this.phase !== PHASE_SHIPS_PLACEMENT) {
      return
    }

    let ship = this.remainingShipsToPlace(PLAYER_GRID)[0]
    
    if (!ship) {
      document.querySelector('#battleship-next-ship-information').style.display = 'none'
      this.displayStartButton()
      return
    } else {
      document.querySelector('#battleship-next-ship-information').style.display = 'block'
    }

    document.querySelector('#battleship-next-ship-name').innerHTML = ship.name
    document.querySelector('#battleship-next-ship-size').innerHTML = ship.size
  }

  displayErrorMessage(message) {
    let errorMessageElement = document.querySelector('#battleship-error-message')
    errorMessageElement.style.display = 'block'

    errorMessageElement.innerHTML = message

    setTimeout(() => {
      errorMessageElement.style.display = 'none'
    }, 2000)
  }

  displayStartButton(state = true) {
    let visibility

    if (state) {
      visibility = 'block'
    } else {
      visibility = 'none'
    }

    document.querySelector('#battleship-start-button').style.display = visibility
  }

  start() {
    if (this.phase !== PHASE_SHIPS_PLACEMENT) {
      return
    }

    this.displayStartButton(false)
    this.setPhase(PHASE_GAME_PLAYER)

    let players = [PHASE_GAME_PLAYER, PHASE_GAME_COMPUTER]
    this.phase = players[Math.floor(Math.random() * players.length)]

    this.#registerFireEventClick()

    if (this.phase === PHASE_GAME_COMPUTER) {
      this.displayPhase('L\'ordinateur tire.')
      this.fireFromComputer()
    } else {
      this.displayPhase('A vous de tirer.')
    }
  }

  #registerFireEventClick() {
    this.battleshipElement.querySelectorAll('.battleship-cell[data-grid="' + COMPUTER_GRID + '"]').forEach(cell => {
      cell.addEventListener('click', event => {
        if (this.phase === PHASE_GAME_PLAYER && !this.isHit(this.cell(COMPUTER_GRID, cell.dataset.col, cell.dataset.row))) {
          this.fire(COMPUTER_GRID, event.target.dataset.col, event.target.dataset.row)
        }
      })
    })
  }

  /*
  Fire from the player.
  */
  async fire(grid, col, row) {
    if (
      (this.phase !== PHASE_GAME_PLAYER && this.phase !== PHASE_GAME_COMPUTER) ||
      this.isHit(this.cell(grid, col, row))
    ) {
      return
    }

    let cell = this.battleshipElement.querySelector('.battleship-cell[data-grid="' + grid + '"][data-col="' + col + '"][data-row="' + row + '"]')
    cell.dataset.hit = true
  
    if (cell.dataset.ship == 'true') {
      this.displayShipHit(cell)

      //Display the message only if the player hits the computer grid.
      if (grid === COMPUTER_GRID) {
        this.displayShipHitMessage()
      }

      let audioExplosion = new Audio('../audio/explosion.mp3')
      audioExplosion.play()

      if (this.isSunk(cell)) {
        let ships

        switch (grid) {
          case PLAYER_GRID:
            ships = this.ships.player
            break

          case COMPUTER_GRID:
            ships = this.ships.computer
            break
        }

        let ship = ships.find(ship => ship.id == cell.dataset.shipId)
        this.displayShip(grid, ship)

        //Display the message only if the player hits the computer grid.
        if (grid === COMPUTER_GRID) {
          this.displayShipSunkMessage()
        }
      }
    } else {
      this.displayWaterHit(cell)

      //Display the message only if the player hits the computer grid.
      if (grid === COMPUTER_GRID) {
        this.displayWaterHitMessage()
      }

      let audioWater = new Audio('../audio/water.mp3')
      audioWater.play()
    }

    let winner = this.checkWinner()

    if (!winner) {
      //Next turn
      if (this.phase === PHASE_GAME_PLAYER) {
        this.phase = PHASE_GAME_COMPUTER
        this.displayPhase('L\'ordinateur tire.')
        this.fireFromComputer()
      } else if (this.phase === PHASE_GAME_COMPUTER) {
        this.displayPhase('A vous de tirer.')
        this.phase = PHASE_GAME_PLAYER
      }
    }
  }

  /*
  Fire from the computer.
  */
  fireFromComputer() {
    setTimeout(() => {
      this.displayShipHitMessage(false)
      this.displayWaterHitMessage(false)
      this.displayShipSunkMessage(false)

      let cellToFire = null

      let cellsWithoutHit = this.cellsWithoutHit(PLAYER_GRID)

      //Find cells already hit
      let cellsHit = this.cellsWithHit(PLAYER_GRID)

      let cellsWithShipHitWithoutSunk = []

      //Remove the cells from a sunk ship from the cells already hit
      for (let i = 0; i < cellsHit.length; i++) {
        if (cellsHit[i].dataset.ship === 'true' && !this.isSunk(cellsHit[i])) {
          cellsWithShipHitWithoutSunk.push(cellsHit[i])
        }
      }

      //Check if a ship that is not sunk yet has been hit.
      if (cellsWithShipHitWithoutSunk.length === 0) {
        //If not, fire randomly on the map.
        cellToFire = cellsWithoutHit[Math.floor(Math.random() * cellsWithoutHit.length)]
      } else {
        //If yes, we need to find the cells where the computer can fire to follow a human logic and eventually destroy a ship.
        let cellPossibilities = []

        //While there is no cell to fire, we look among the remaining possibilities (stored in "cellPossibilities")
        while (cellToFire === null) {
          //For each cell, get the 4 cells around it and, if one of them is not hit, then add it as a cell on which we can fire on.
          for (let i = 0; i < cellsWithShipHitWithoutSunk.length; i++) {
            let cell = cellsWithShipHitWithoutSunk[i]
    
            let hitCellsFromSameShipAround = 0
            let cellFound = null
    
            //Check if cell to the right is in the map borders
            let nextCol = String.fromCharCode(cell.dataset.col.charCodeAt(0) + 1)
            if (nextCol <= String.fromCharCode(64 + this.mapSize - 1)) {
              let nextCell = this.cell(PLAYER_GRID, nextCol, parseInt(cell.dataset.row))
    
              if (nextCell.dataset.shipId == cell.dataset.shipId && this.isHit(nextCell)) {
                hitCellsFromSameShipAround++
              }
    
              //If this cell is not hit, then we say we found a cell.
              if (!this.isHit(nextCell) && cellFound === null) {
                cellFound = cell
              }
            }
    
            //Check if cell to the left is in the map borders
            let previousCol = String.fromCharCode(cell.dataset.col.charCodeAt(0) - 1)
            if (previousCol >= 'A') {
              let previousCell = this.cell(PLAYER_GRID, previousCol, parseInt(cell.dataset.row))
    
              if (previousCell.dataset.shipId == cell.dataset.shipId && this.isHit(previousCell)) {
                hitCellsFromSameShipAround++
              }
      
              //If this cell is not hit, then we say we found a cell.
              if (!this.isHit(previousCell) && cellFound === null) {
                cellFound = cell
              }
            }
    
            //Check if cell to the bottom is in the map borders
            let nextRow = parseInt(cell.dataset.row) + 1
            if (nextRow <= this.mapSize - 1) {
              let nextCell = this.cell(PLAYER_GRID, cell.dataset.col, parseInt(nextRow))
    
              if (nextCell.dataset.shipId == cell.dataset.shipId && this.isHit(nextCell)) {
                hitCellsFromSameShipAround++
              }
    
              //If this cell is not hit, then we say we found a cell.
              if (!this.isHit(nextCell) && cellFound === null) {
                cellFound = cell
              }
            }
    
            //Check if cell to the top is in the map borders
            let previousRow = parseInt(cell.dataset.row) - 1
            if (previousRow >= 1) {
              let previousCell = this.cell(PLAYER_GRID, cell.dataset.col, parseInt(previousRow))
    
              if (previousCell.dataset.shipId == cell.dataset.shipId && this.isHit(previousCell)) {
                hitCellsFromSameShipAround++
              }
    
              //If this cell is not hit, then we say we found a cell.
              if (!this.isHit(previousCell) && cellFound === null) {
                cellFound = cell
              }
            }
    
            //"hitCellsFromSameShipAround < 2" allows to only include the extremities of ship hit sequence, because we only need the extremities to choose the next cell on which the computer will fire.
            if (hitCellsFromSameShipAround < 2 && cellFound !== null) {
              cellPossibilities.push(cellFound)
            }
          }
    
          console.log(cellPossibilities)

          //If no possibilities, fire in water
    
          //Check if some possibilities have been found
          if (cellPossibilities.length === 0) {
            //If not, fire in water
            cellToFire = cellsWithoutHit[Math.floor(Math.random() * cellsWithoutHit.length)]
          } else {
            //If yes
            
            //Choose a random cell among our possibilities
            let cellToCheck = cellPossibilities[Math.floor(Math.random() * cellPossibilities.length)]
    
            
            let cellPossibilitiesAroundCellToCheck = []
    
            //Then, we need to know if we can identify a direction

            let directions = ['horizontal', 'vertical']

            //At first, set random direction
            let direction = directions[Math.floor(Math.random() * directions.length)]

            let directionFound = false
    
            //Check if cell to the right is in the map borders
            let nextCol = String.fromCharCode(cellToCheck.dataset.col.charCodeAt(0) + 1)
            if (nextCol <= String.fromCharCode(64 + this.mapSize - 1)) {
              let nextCell = this.cell(PLAYER_GRID, nextCol, parseInt(cellToCheck.dataset.row))
    
              cellPossibilitiesAroundCellToCheck.push(nextCell)
    
              //If this cell is hit and does not belong to a sunk ship, then we can deduct a direction
              if (this.isHit(nextCell) && this.anyShipOnCell(nextCell) && !this.isSunk(nextCell) && !directionFound) {
                direction = 'horizontal'
                directionFound = true
              }
            }
    
            //Check if cell to the left is in the map borders
            let previousCol = String.fromCharCode(cellToCheck.dataset.col.charCodeAt(0) - 1)
            if (previousCol >= 'A') {
              let previousCell = this.cell(PLAYER_GRID, previousCol, parseInt(cellToCheck.dataset.row))
    
              cellPossibilitiesAroundCellToCheck.push(previousCell)
    
              //If this cell is hit and does not belong to a sunk ship, then we can deduct a direction
              if (this.isHit(previousCell) && this.anyShipOnCell(previousCell) && !this.isSunk(previousCell) && !directionFound) {
                direction = 'horizontal'
                directionFound = true
              }
            }
    
            //Check if cell to the bottom is in the map borders
            let nextRow = parseInt(cellToCheck.dataset.row) + 1
            if (nextRow <= this.mapSize - 1) {
              let nextCell = this.cell(PLAYER_GRID, cellToCheck.dataset.col, parseInt(nextRow))
    
              cellPossibilitiesAroundCellToCheck.push(nextCell)
    
              //If this cell is hit and does not belong to a sunk ship, then we can deduct a direction
              if (this.isHit(nextCell) && this.anyShipOnCell(nextCell) && !this.isSunk(nextCell) && !directionFound) {
                direction = 'vertical'
                directionFound = true
              }
            }
    
            //Check if cell to the top is in the map borders
            let previousRow = parseInt(cellToCheck.dataset.row) - 1
            if (previousRow >= 1) {
              let previousCell = this.cell(PLAYER_GRID, cellToCheck.dataset.col, parseInt(previousRow))
    
              cellPossibilitiesAroundCellToCheck.push(previousCell)
    
              //If this cell is hit and does not belong to a sunk ship, then we can deduct a direction
              if (this.isHit(previousCell) && this.anyShipOnCell(previousCell) && !this.isSunk(previousCell) && !directionFound) {
                direction = 'vertical'
                directionFound = true
              }
            }
    
            //Check if a direction has been found
            if (!directionFound) {
              //If no direction found based on previous hits, it might be because there are only hits in the water around the cellToCheck, except for one cell that has not been hit yet.
              
              for (let i = 0; i < cellPossibilitiesAroundCellToCheck.length; i++) {
                //If we find that cell that has not been hit yet, then the computer fire it.
                if (!this.isHit(cellPossibilitiesAroundCellToCheck[i])) {
                  cellToFire = cellPossibilitiesAroundCellToCheck[i]
                  break
                }
              }
            } else {
              //If a direction has been found, we need to know which in order to choose the cell to fire.

              let cellsToFire = []
              if (direction === 'vertical') {
                for (let i = 0; i < cellsWithoutHit.length; i++) {
                  //We check the cell at the top and the cell at the bottom of the cellToCheck. If one of them has not been hit yet, we set this cell as an eventual cell to fire.
                  if (cellsWithoutHit[i].dataset.col === cellToCheck.dataset.col && (parseInt(cellsWithoutHit[i].dataset.row) === parseInt(cellToCheck.dataset.row) - 1 || parseInt(cellsWithoutHit[i].dataset.row) === parseInt(cellToCheck.dataset.row) + 1)) {
                    cellsToFire.push(cellsWithoutHit[i])
                  }
                }
              } else if (direction === 'horizontal') {
                for (let i = 0; i < cellsWithoutHit.length; i++) {
                  //We check the cell at the right and the cell at the left of the cellToCheck. If one of them has not been hit yet, we set this cell as an eventual cell to fire.
                  if (parseInt(cellsWithoutHit[i].dataset.row) === parseInt(cellToCheck.dataset.row) && (cellsWithoutHit[i].dataset.col === String.fromCharCode(cellToCheck.dataset.col.charCodeAt(0) - 1) || cellsWithoutHit[i].dataset.col === String.fromCharCode(cellToCheck.dataset.col.charCodeAt(0) + 1))) {
                    cellsToFire.push(cellsWithoutHit[i])
                  }
                }
              }
    
              //Check if we found any cells to fire
              if (cellsToFire.length === 0) {
                //If not, we try in the other direction
                if (direction === 'vertical') {
                  for (let i = 0; i < cellsWithoutHit.length; i++) {
                    //We check the cell at the right and the cell at the left of the cellToCheck. If one of them has not been hit yet, we set this cell as an eventual cell to fire.
                    if (parseInt(cellsWithoutHit[i].dataset.row) === parseInt(cellToCheck.dataset.row) && (cellsWithoutHit[i].dataset.col === String.fromCharCode(cellToCheck.dataset.col.charCodeAt(0) - 1) || cellsWithoutHit[i].dataset.col === String.fromCharCode(cellToCheck.dataset.col.charCodeAt(0) + 1))) {
                      cellsToFire.push(cellsWithoutHit[i])
                    }
                  }
                } else if (direction === 'horizontal') {
                  for (let i = 0; i < cellsWithoutHit.length; i++) {
                    //We check the cell at the top and the cell at the bottom of the cellToCheck. If one of them has not been hit yet, we set this cell as an eventual cell to fire.
                    if (cellsWithoutHit[i].dataset.col === cellToCheck.dataset.col && (parseInt(cellsWithoutHit[i].dataset.row) === parseInt(cellToCheck.dataset.row) - 1 || parseInt(cellsWithoutHit[i].dataset.row) === parseInt(cellToCheck.dataset.row) + 1)) {
                      cellsToFire.push(cellsWithoutHit[i])
                    }
                  }
                }

                //Last attempt to check if there are any cells to fire after having tried the other direction
                if (cellsToFire.length === 0) {
                  //If not, we remove the cellToCheck from the cellPossibilities, and we will then go back at the start of the while loop to check the other ones
                  cellPossibilities = cellPossibilities.filter(cellPossibility => {
                    return cellPossibility.dataset.col === cellToCheck.dataset.col && cellPossibility.dataset.row === cellToCheck.dataset.row
                  })
                } else {
                  //If yes, we choose a random cell to fire
                  cellToFire = cellsToFire[Math.floor(Math.random() * cellsToFire.length)]
                }
              } else {
                //If yes, we choose a random cell to fire
                cellToFire = cellsToFire[Math.floor(Math.random() * cellsToFire.length)]
              }  
            }
          }
        }
      }
      
      this.fire(PLAYER_GRID, cellToFire.dataset.col, cellToFire.dataset.row)
    }, 1000)

    
  }

  displayWaterHit(cell) {
    cell.classList.add('text-white')
    cell.innerHTML = 'X'
  }

  displayShipHit(cell) {
    cell.classList.add('text-red-500')
    cell.innerHTML = 'O'
  }

  isHit(cell) {
    return cell.dataset.hit == 'true'
  }

  isSunk(cell) {
    if (cell.dataset.ship == 'false') {
      return false
    }

    let sunk = true

    let placedShips

    switch (parseInt(cell.dataset.grid)) {
      case PLAYER_GRID:
        placedShips = this.ships.player
        break
      
      case COMPUTER_GRID:
        placedShips = this.ships.computer
        break
    }
  
    placedShips.forEach(placedShip => {
      if (placedShip.id === parseInt(cell.dataset.shipId)) {
        placedShip.cells.forEach(placedShipCell => {
          if (!this.isHit(this.cell(cell.dataset.grid, placedShipCell.col, placedShipCell.row))) {
            sunk = false
            return
          }
        })

        return
      }
    })

    return sunk
  }

  anyShipOnCell(cell) {
    return cell.dataset.ship == 'true'
  }

  checkWinner() {
    let computerWinner = true
  
    this.ships.player.forEach(ship => {
      ship.cells.forEach(cell => {
        if (!this.isHit(this.cell(PLAYER_GRID, cell.col, cell.row))) {
          computerWinner = false
          return
        }
      })
    })

    let playerWinner = true

    this.ships.computer.forEach(ship => {
      ship.cells.forEach(cell => {
        if (!this.isHit(this.cell(COMPUTER_GRID, cell.col, cell.row))) {
          playerWinner = false
          return
        }
      })
    })

    if (playerWinner || computerWinner) {
      this.setPhase(PHASE_GAME_ENDED)

      this.displayPhase('', false)
      this.displayRestartButton()

      if (playerWinner) {
        this.displayWinMessage(PLAYER_GRID)
      } else if (computerWinner) {
        this.displayWinMessage(COMPUTER_GRID)
      }

      return true
    }

    return false
  }

  displayPhase(message, state = true) {
    let visibility

    if (state) {
      visibility = 'block'
      document.querySelector('#battleship-phase').innerHTML = message
    } else {
      visibility = 'none'
      document.querySelector('#battleship-phase').innerHTML = ''
    }

    document.querySelector('#battleship-phase').style.display = visibility
  }

  displayShipHitMessage(state = true) {
    let visibility

    if (state) {
      visibility = 'block'
      document.querySelector('#battleship-ship-hit-message').innerHTML = 'Touché !'
    } else {
      visibility = 'none'
      document.querySelector('#battleship-ship-hit-message').innerHTML = ''
    }

    document.querySelector('#battleship-ship-hit-message').style.display = visibility
  }

  displayWaterHitMessage(state = true) {
    let visibility

    if (state) {
      visibility = 'block'
      document.querySelector('#battleship-water-hit-message').innerHTML = 'Raté !'
    } else {
      visibility = 'none'
      document.querySelector('#battleship-water-hit-message').innerHTML = ''
    }

    document.querySelector('#battleship-water-hit-message').style.display = visibility
  }

  displayShipSunkMessage(state = true) {
    let visibility

    if (state) {
      visibility = 'block'
      document.querySelector('#battleship-ship-sunk-message').innerHTML = 'Coulé !'
    } else {
      visibility = 'none'
      document.querySelector('#battleship-ship-sunk-message').innerHTML = ''
    }

    document.querySelector('#battleship-ship-sunk-message').style.display = visibility
  }

  displayWinMessage(winner = null, state = true) {
    let visibility
    let message

    if (state) {
      visibility = 'block'

      switch (winner) {
        case PLAYER_GRID:
          message = 'Vous avez gagné !'
          break
  
        case COMPUTER_GRID:
          message = 'L\'ordinateur a gagné !'
          break
      }
    } else {
      visibility = 'none'
    }
  
    document.querySelector('#battleship-win-message').innerHTML = message
    document.querySelector('#battleship-win-message').style.display = visibility
  }

  displayRestartButton(state = true) {
    let visibility

    if (state) {
      visibility = 'block'
      this.#registerRestartEventClick()
    } else {
      visibility = 'none'
    }

    document.querySelector('#battleship-restart-button').style.display = visibility
  }

  #registerRestartEventClick() {
    document.querySelector('#battleship-restart-button button').addEventListener('click', event => {
      this.reset()
    })
  }

  /*
  Display or hide the map size selector
  */
  static displayMapSizeChoice(state = true) {
    let visibility

    if (state) {
      visibility = 'block'
    } else {
      visibility = 'none'
    }

    document.querySelector('#battleship-map-size-choice').style.display = visibility
  }

  /*
  Reset the battleship in order to start a fresh new game.
  */
  reset() {
    //Hide all messages.
    this.displayWinMessage(null, false)
    this.displayShipHitMessage(false)
    this.displayShipSunkMessage(false)
    this.displayWaterHitMessage(false)
    this.displayRestartButton(false)

    //Clean the map.
    this.#cleanMap()

    //Remove player & computer's ships position.
    this.ships.player = []
    this.ships.computer = []

    //Set the phase to ships placement.
    this.setPhase(PHASE_SHIPS_PLACEMENT)

    //Place all the computer's ships.
    this.placeShipsComputer()

    //Display the next ship the player has to place.
    this.displayNextShipInformation()
  }
}

//Ships available in the battleship
let ships = [
  {
    id: 1,
    name: 'Porte-avions',
    size: 5,
    imagePaths: [
      '../img/sprites/porteavion/1.png',
      '../img/sprites/porteavion/2.png',
      '../img/sprites/porteavion/3.png',
      '../img/sprites/porteavion/4.png',
      '../img/sprites/porteavion/5.png',
    ]
  },
  {
    id: 2,
    name: 'Croiseur',
    size: 4,
    imagePaths: [
      '../img/sprites/croiseur/1.png',
      '../img/sprites/croiseur/2.png',
      '../img/sprites/croiseur/3.png',
      '../img/sprites/croiseur/4.png',
    ]
  },
  {
    id: 3,
    name: 'Sous-marin',
    size: 3,
    imagePaths: [
      '../img/sprites/sousmarin/1.png',
      '../img/sprites/sousmarin/2.png',
      '../img/sprites/sousmarin/3.png',
    ]
  },
  {
    id: 4,
    name: 'Sous-marin',
    size: 3,
    imagePaths: [
      '../img/sprites/sousmarin/1.png',
      '../img/sprites/sousmarin/2.png',
      '../img/sprites/sousmarin/3.png',
    ]
  },
  {
    id: 5,
    name: 'Torpilleur',
    size: 2,
    imagePaths: [
      '../img/sprites/torpilleur/1.png',
      '../img/sprites/torpilleur/2.png',
    ]
  }
]

document.querySelector('#battleship-map-size-choice button').addEventListener('click', event => {
  document.querySelector('#battleship-messages').style.display = 'block'

  //Generate the battleship
  let b = new Battleship(battleshipId = '#battleship', parseInt(document.querySelector('input[name="battleship-map-size-input"]:checked').value), ships)

  b.displayNextShipInformation()
  b.placeShipsComputer()
})