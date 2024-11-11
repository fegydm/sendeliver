// ./front/src/App.tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Tailwind Test</h1>
        <button className="bg-hauler-primary-500 text-white px-4 py-2 rounded hover:bg-hauler-primary-600">
          Test Button
        </button>
        <div className="mt-4 p-4 bg-white shadow-medium rounded">
          <p className="text-gray-800">
            If you see styled elements, Tailwind is working!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
