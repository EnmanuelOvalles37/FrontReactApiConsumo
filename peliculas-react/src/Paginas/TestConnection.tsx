import { useState } from 'react';

const TestConnection = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPIConnection = async () => {
    setLoading(true);
    setTestResult('Probando conexión con el backend...');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: 'admin',
          contrasena: 'admin'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult('✅ CONEXIÓN EXITOSA! Backend y frontend comunicándose.');
        console.log('Data recibida:', data);
      } else {
        setTestResult(`❌ Error HTTP: ${response.status} - ${response.statusText}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setTestResult(`❌ Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f0f9ff', 
      margin: '20px', 
      borderRadius: '8px',
      border: '2px solid #0ea5e9'
    }}>
      <h3 style={{ color: '#0369a1' }}>Prueba de Conexión Backend-Frontend</h3>
      <button 
        onClick={testAPIConnection} 
        disabled={loading}
        style={{ 
          margin: '10px', 
          padding: '10px 20px',
          background: '#0ea5e9',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Probando...' : 'Probar Conexión'}
      </button>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: 'white',
        borderRadius: '5px',
        border: '1px solid #ddd'
      }}>
        <strong>Resultado:</strong> 
        <div style={{ 
          color: testResult.includes('✅') ? 'green' : 'red',
          marginTop: '10px',
          fontWeight: 'bold'
        }}>
          {testResult}
        </div>
      </div>
    </div>
  );
};

export default TestConnection;