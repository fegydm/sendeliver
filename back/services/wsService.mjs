// ./back/services/wsService.js
export const handleMessage = async (ws, data) => {
  try {
    console.log('Processing message:', data.toString());
    
    // Simple echo server for testing
    ws.send(JSON.stringify({
      type: 'echo',
      data: data.toString()
    }));
    
  } catch (err) {
    console.error('Error in handleMessage:', err);
    ws.send(JSON.stringify({
      type: 'error',
      message: err.message
    }));
  }
};