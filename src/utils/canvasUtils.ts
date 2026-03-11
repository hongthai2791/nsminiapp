export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return ''
  }

  canvas.width = image.width
  canvas.height = image.height

  ctx.translate(image.width / 2, image.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  ctx.drawImage(image, 0, 0)

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(data, 0, 0)

  return canvas.toDataURL('image/jpeg')
}

export async function generateFinalCard(
  croppedImageSrc: string,
  name: string,
  className: string
): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Try to load the template image
  let templateImg: HTMLImageElement | null = null;
  try {
    templateImg = await createImage('/template.jpg');
    canvas.width = templateImg.width;
    canvas.height = templateImg.height;
  } catch (e) {
    console.warn("Could not load /template.jpg, falling back to default background");
    canvas.width = 1080;
    canvas.height = 1500;
  }

  if (templateImg) {
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
  } else {
    // Fallback Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1e3a8a')
    gradient.addColorStop(1, '#2563eb')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Fallback text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 44px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('KỶ NIỆM 95 NĂM NGÀY THÀNH LẬP', canvas.width/2, 140)
  }

  // Calculate coordinates based on canvas size
  // These percentages are estimated from the provided template
  const avatarCenterX = canvas.width * 0.285;
  const avatarCenterY = canvas.height * 0.335;
  const avatarRadius = canvas.width * 0.165;
  
  const avatarImg = await createImage(croppedImageSrc)
  
  ctx.save()
  ctx.beginPath()
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(
    avatarImg, 
    avatarCenterX - avatarRadius, 
    avatarCenterY - avatarRadius, 
    avatarRadius * 2, 
    avatarRadius * 2
  )
  ctx.restore()

  // Text placement
  ctx.fillStyle = '#8b0000'; // Dark red for the name to match template style
  // Adjust font size based on canvas width
  const fontSize = Math.floor(canvas.width * 0.035);
  ctx.font = `bold ${fontSize}px "Times New Roman", serif`;
  ctx.textAlign = 'center';
  
  // Place name below "Thân tặng đồng chí:"
  const nameX = canvas.width * 0.72;
  const nameY = canvas.height * 0.32;
  ctx.fillText(name.toUpperCase(), nameX, nameY);
  
  // Place class name below the name
  const classFontSize = Math.floor(canvas.width * 0.025);
  ctx.font = `italic ${classFontSize}px "Times New Roman", serif`;
  ctx.fillText(className, nameX, nameY + fontSize * 1.5);

  return canvas.toDataURL('image/jpeg', 0.9)
}
