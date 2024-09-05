async function checkServerStatus(url) {  

    try {
        const response = await fetch(url);
        if (response.ok) {
            return true;
        } else {
            return false;
        }
      } catch (error) {
        return false;
      }
  }

export default checkServerStatus;
