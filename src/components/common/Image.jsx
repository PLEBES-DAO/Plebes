import React from 'react';

const Image = ({ src, width, height, alt }) => {
  return (
    <img
      src={src}
      width={width}
      height={height}
      alt={alt}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default Image;
