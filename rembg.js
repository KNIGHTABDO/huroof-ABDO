const Jimp = require('jimp');

Jimp.read('public/assets/logo_gs.png')
  .then(image => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // If the pixel is distinctly green
      if (g > 150 && r <= 150 && b <= 150) {
        this.bitmap.data[idx + 3] = 0; // Alpha 0 (transparent)
      } else if (g > r + 30 && g > b + 30 && g > 80) {
        // Soft edge handling for anti-aliasing
        this.bitmap.data[idx + 3] = 0;
      }
    });

    return image.writeAsync('public/assets/logo_transparent.png');
  })
  .then(() => console.log('SUCCESS: Background removed!'))
  .catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
