/**
 * Compresse et redimensionne une image côté navigateur avant l'upload, pour économiser
 * la data mobile des utilisateurs (important au Togo) et accélérer le chargement du site.
 * Redimensionne à 1200px de large maximum, réencode en JPEG qualité 0.75.
 */
export function compressImage(file: File, maxWidth = 1200, quality = 0.75): Promise<File> {
  return new Promise((resolve, reject) => {
    // Ne compresse pas les GIF (perdrait l'animation) — on les laisse tels quels
    if (file.type === "image/gif") {
      resolve(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const newName = file.name.replace(/\.\w+$/, ".jpg");
          resolve(new File([blob], newName, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("Image invalide"));

    reader.readAsDataURL(file);
  });
}
