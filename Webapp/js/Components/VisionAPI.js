class VisionAPI {
    constructor() {
    }
 
    async saveImage(imageData) {
        try {
            const response = await fetch('http://localhost:3000/vision', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageData })
            });

            if (!response.ok) {
                throw new Error('Error processing vision request');
            }

            const result = await response.json();
            this.displayVisionResult(result.result);

        } catch (error) {
            console.error('Error:', error);
            this.displayVisionResult('Error analyzing image');
            throw error;
        }
    }

    displayVisionResult(result) {
        const gptVisionText = document.getElementById('gpt-vision-text');
        gptVisionText.textContent = result;
      }

    displayGenerationResult(result){
        const img = document.querySelector('#generatedImage');
        img.src = result;
        img.style.display = "block"
    }

    async sendToDalle(imageData) {
        try {
            const response = await fetch('http://localhost:3000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify({ image: imageData })
            });

            if (!response.ok) {
                throw new Error('Error processing Dall-E request');
            }

            const result = await response.json()
             //console.log(result.result.imageUrl)
            this.displayGenerationResult(result.result.imageUrl)
            this.displayVisionResult("Image Generated");

        } catch (error) {
            console.error('Error:', error);
            this.displayVisionResult('Error generating image');
            throw error;
        }
    }
}

export default VisionAPI;
