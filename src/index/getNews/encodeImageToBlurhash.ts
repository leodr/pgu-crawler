import { encode } from 'blurhash';
import { createCanvas, Image } from 'canvas';

const loadImage = async (src: string): Promise<Image> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = (): void => resolve(img);
        img.onerror = (...args): void => reject(args);
        img.src = src;
    });

const getImageData = (image: Image) => {
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height);
};

interface EncodedImageData {
    width: number;
    height: number;
    blurHash: string;
}

const encodeImageToBlurhash = async (
    imageUrl: string,
): Promise<EncodedImageData> => {
    const image = await loadImage(imageUrl);
    const { data: imageData, width, height } = getImageData(image);

    const aspectRatio = width / height;

    const totalComponents = 10;

    const componentX = Math.round(
        (aspectRatio * totalComponents) / (1 + aspectRatio),
    );

    const componentY = totalComponents - componentX;

    const blurHash = encode(imageData, width, height, componentX, componentY);

    return { width, height, blurHash };
};

export default encodeImageToBlurhash;
