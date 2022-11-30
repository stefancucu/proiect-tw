const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

module.exports = async function fetchImages() {
    const imgJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, "galerie.json"), "utf8")
      );
  let images = imgJson.imagini;
  let sfert_ora = Math.floor(new Date().getMinutes() / 15) + 1;
  images = images.filter((img) => img.sfert_ora == sfert_ora).slice(0, 10);
  // replace the image path (imgJson.cale_baza + img.cale_imagine) with the base64 image data
  images.forEach((img) => {
    img.cale_imagine = fs.readFileSync(
      path.join(__dirname, imgJson.cale_baza, img.cale_imagine),
      "base64"
    );
  });
  // add the fields cale_imagine_small and cale_imagine_medium to the images with the base64 image data of the images from cale_imagine resized to 200x200 and 300x300
  for (let img of images) {
    img.cale_imagine_small = await sharp(
      Buffer.from(img.cale_imagine, "base64")
    )
      .resize(200, 200)
      .toBuffer().then((data) => data.toString("base64"));
    img.cale_imagine_medium = await sharp(
      Buffer.from(img.cale_imagine, "base64")
    )
      .resize(300, 300)
      .toBuffer().then((data) => data.toString("base64"));
  }
  return images;
};
