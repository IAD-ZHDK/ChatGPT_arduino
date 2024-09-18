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
}

export default VisionAPI;
