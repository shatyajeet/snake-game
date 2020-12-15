import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components';

import './App.css';

const playgroundSide = 11
const MAX_WIDTH = 30
const initialState = [Math.ceil(Math.random() * (playgroundSide * playgroundSide))]
const sqWidth = (document.documentElement.clientWidth - 32) / playgroundSide

function App() {
  const [snake, setSnake] = useState(initialState)
  const [gameInterval, setGameInterval] = useState(200)
  const [direction, setDirection] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [currentApple, setCurrentApple] = useState(null)
  const [updated, setUpdated] = useState(true)
  const [ended, setEnded] = useState(false)
  const [score, setScore] = useState(0)

  useInterval(updateGame, isRunning ? gameInterval : null)

  useEffect(() => {
    setGameInterval(400)
    const playGround = document.getElementById('playground')
    playGround.focus()
  }, [])

  function updateGame () {
    const head = snake.slice(-1)[0]
    const body = snake.slice(0, -1)
    const newHead = head + direction
    const newBody = body.map((it, idx) => snake[idx + 1])
    setUpdated(true)
    if (newBody.includes(newHead)) {
      stopGame('OWN_BODY')
      setEnded(true)
      return
    } else if (checkWallHits(newHead)) {
      stopGame('WALL')
      setEnded(true)
      return
    }
    const newSnake = [
      ...newBody,
      newHead
    ]
    if (newHead === currentApple) {
      setScore(score + 1)
      newSnake.unshift(snake[0])
      setNewApple(newSnake)
    }
    setSnake(newSnake)
  }

  function checkWallHits (head) {
    switch (direction) {
      case 1:
        return head % playgroundSide === 1
      case -1:
        return head % playgroundSide === 0
      case playgroundSide:
        return head > (playgroundSide * playgroundSide)
      case -(playgroundSide):
        return head < 1
      default:
        return false
    }
  }

  function startGame () {
    if (ended) {
      resetGame()
      setEnded(false)
    }
    if (!currentApple) {
      setNewApple(snake)
    }
    setIsRunning(true)
    const playGround = document.getElementById('playground')
    playGround.focus()
  }

  function pauseGame () {
    setIsRunning(false)
  }

  function toggleGame () {
    return isRunning ? pauseGame() : startGame()
  }

  function resetGame () {
    setSnake(initialState)
    setIsRunning(false)
    setCurrentApple(null)
    setDirection(1)
    setScore(0)
  }

  function stopGame (crashReason) {
    setIsRunning(false)
    setEnded(true)
    console.log(crashReason)
  }

  function setNewApple (currentSnake) {
    let randomApple = Math.ceil(Math.random() * (playgroundSide * playgroundSide))
    if (currentSnake.includes(randomApple)) {
      setNewApple(currentSnake)
    } else {
      setCurrentApple(randomApple)
    }
  }

  function handleKeyDown (e) {
    if (!updated) {
      return
    }
    const { code } = e
    switch (code) {
      case 'ArrowUp':
        return handleDirectionChange('up')
      case 'ArrowDown':
        return handleDirectionChange('down')
      case 'ArrowLeft':
        return handleDirectionChange('left')
      case 'ArrowRight':
        return handleDirectionChange('right')
      case 'Space':
        return toggleGame()
      case 'Escape':
        return resetGame()
      default:
        return
    }
  }

  function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    useEffect(() => {
      savedCallback.current = callback;
    });
  
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
  
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  function handleDirectionChange (newDir) {
    setUpdated(false)
    switch (newDir) {
      case 'up':
        if (direction !== playgroundSide) {
          setDirection(-(playgroundSide))
        }
        break
      case 'down':
        if (direction !== -(playgroundSide)) {
          setDirection(playgroundSide)
        }
        break
      case 'left':
        if (direction !== 1) {
          setDirection(-1)
        }
        break
      case 'right':
        if (direction !== -1) {
          setDirection(1)
        }
        break
      default:
        setDirection(direction)
    }
  }
  
  return (
    <div className="App">
      <div className="score">Score: {score}</div>
      <div id="playground" onKeyDown={handleKeyDown} className="play-ground" tabIndex={-1}>
        {Array(playgroundSide).fill(null).map((it, idx) => <div className="row" key={idx}>
          {Array(playgroundSide).fill(null).map((it, index) => {
            const currentCoordinates = idx * playgroundSide + index + 1
            const isApple = currentCoordinates === currentApple
            const isSnakeBody = snake.includes(currentCoordinates)
            const isSnakeHead = currentCoordinates === snake.slice(-1)[0]
            const currentClass = isSnakeHead ? ' snake head' : isApple ? ' apple' : isSnakeBody ? ' snake' : ''
            return <Square maxWidth={MAX_WIDTH} width={sqWidth} className={`sq${currentClass}`} key={index} />
          })}
        </div>)}
      </div>
      <div className="nav">
        <div className="top-nav">
          <div className="row">
            <button onClick={() => handleDirectionChange('up')}>Up</button>
          </div>
          <div className="row middle">
            <button onClick={() => handleDirectionChange('left')}>Left</button>
            <button onClick={() => handleDirectionChange('right')}>Right</button>
          </div>
          <div className="row">
            <button onClick={() => handleDirectionChange('down')}>Down</button>
          </div>
        </div>
        <div className="bottom-nav">
          <button onClick={toggleGame}>{isRunning ? 'Pause' : 'Play'}</button>
          <button onClick={resetGame}>Reset</button>
        </div>
      </div>
    </div>
  );
}

const Square = styled.div`
  max-width: ${_ => _.maxWidth}px;
  max-height: ${_ => _.maxWidth}px;
  height: ${_ => _.width}px;
  width: ${_ => _.width}px;
`

export default App;
