import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

const PhaserGame = ({ scenes, onGameReady }) => {
  const gameRef = useRef(null);
  const parentRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (gameRef.current || !parentRef.current) return;

    const parentWidth = parentRef.current.clientWidth || window.innerWidth;
    const parentHeight = parentRef.current.clientHeight || window.innerHeight;

    const config = {
      type: Phaser.AUTO,
      width: parentWidth,
      height: parentHeight,
      parent: parentRef.current,
      backgroundColor: 'transparent',
      transparent: true,
      render: {
        antialias: true,
        antialiasGL: true,
        pixelArt: false
      },
      scene: scenes,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      }
    };

    try {
      const game = new Phaser.Game(config);
      gameRef.current = game;

        if (game.canvas) {
          game.canvas.style.width = '100%';
          game.canvas.style.height = '100%';
        }

        if (game.isBooted) {
          setIsReady(true);
        } else {
          game.events.once('ready', () => {
            setIsReady(true);
          });
        }

      const handleResize = () => {
        if (gameRef.current && parentRef.current) {
          gameRef.current.scale.refresh();
          if (gameRef.current.canvas) {
            gameRef.current.canvas.style.width = '100%';
            gameRef.current.canvas.style.height = '100%';
          }
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing Phaser:', error);
    }
  }, [scenes, onGameReady]);

  return (
    <div
      ref={parentRef}
      className="w-full h-full"
      style={{ width: '100%', height: '100%', minHeight: '0' }}
    />
  );
};

export default PhaserGame;
