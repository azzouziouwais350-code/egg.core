import React from 'react';
import { spriteUrl } from '../assets';

// Sprite d'un œuf dans un état donné (idle | selected | cooking | almost | done).
export default function EggSprite({ egg, state, className = '', size }) {
  return (
    <img
      className={`egg-sprite ${className}`}
      src={spriteUrl(egg, state)}
      alt=""
      aria-hidden="true"
      draggable="false"
      width={size}
      height={size}
    />
  );
}
