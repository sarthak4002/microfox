import { useState, useEffect, useRef } from 'react';
import { FunctionParams, ApiResponse } from '../types';

export interface MainSdk {
  [key: string]: any;
}

export interface SdkFunction {
  name: string;
  description: string;
  params: Record<string, any>;
  isObjectParam?: boolean;
}

export interface SdkCategory {
  [key: string]: SdkFunction[];
}

interface SdkTesterProps {
  mainSdk: MainSdk | null;
  functionCategories: SdkCategory;
  sdkName: string;
  onInitiateOAuth: () => void;
  onAuthenticated: (accessToken: string, refreshToken: string) => void;
}

export default function SdkTester({
  mainSdk,
  functionCategories,
  sdkName,
  onInitiateOAuth,
  onAuthenticated
}: SdkTesterProps) {
  const [accessToken, setAccessToken] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [functionParams, setFunctionParams] = useState<FunctionParams>({});
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Store the callback in a ref to avoid dependency issues
  const onAuthenticatedRef = useRef(onAuthenticated);
  
  // Update the ref when the callback changes
  useEffect(() => {
    onAuthenticatedRef.current = onAuthenticated;
  }, [onAuthenticated]);

  useEffect(() => {
    // Check for tokens in localStorage
    const accessToken = localStorage.getItem(`${sdkName.toLowerCase()}_access_token`);
    const refreshToken = localStorage.getItem(`${sdkName.toLowerCase()}_refresh_token`);
    const errorParam = new URLSearchParams(window.location.search).get('error');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    } else if (accessToken) {
      setAccessToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      setIsAuthenticated(true);
      onAuthenticatedRef.current(accessToken, refreshToken || '');
    }
  }, [sdkName]);

  const handleFunctionSelect = (funcName: string) => {
    setSelectedFunction(funcName);
    // Find the default params for this function
    for (const category of Object.values(functionCategories)) {
      const func = category.find(f => f.name === funcName);
      if (func) {
        setFunctionParams(func.params);
        break;
      }
    }
  };

  const executeFunction = async () => {
    if (!mainSdk || !selectedFunction) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Find the selected function definition
      let selectedFuncDef: SdkFunction | undefined;
      for (const category of Object.values(functionCategories)) {
        const func = category.find(f => f.name === selectedFunction);
        if (func) {
          selectedFuncDef = func;
          break;
        }
      }
      
      // Execute the selected function with the provided parameters
      let result;
      if (selectedFuncDef?.isObjectParam === false) {
        // If not an object param, convert the object to an array of values
        const paramValues = Object.values(functionParams);
        result = await (mainSdk as any)[selectedFunction](...paramValues);
      } else {
        // Default behavior: pass as a single object
        result = await (mainSdk as any)[selectedFunction](functionParams);
      }
      
      setResult({ success: true, data: result });
    } catch (err) {
      setError('Function call failed: ' + (err as Error).message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const updateParamValue = (key: string, value: any) => {
    setFunctionParams(prev => {
      const newParams = { ...prev };
      
      // Handle nested keys (e.g., "preferences.theme")
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        newParams[parent] = { ...newParams[parent], [child]: value };
      } else {
        newParams[key] = value;
      }
      
      return newParams;
    });
  };

  const renderParamInput = (key: string, value: any, parentKey: string = '') => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    
    if (typeof value === 'boolean') {
      return (
        <div key={fullKey} className="param-input">
          <label>{key}:</label>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => updateParamValue(fullKey, e.target.checked)}
          />
        </div>
      );
    } else if (typeof value === 'number') {
      return (
        <div key={fullKey} className="param-input">
          <label>{key}:</label>
          <input
            type="number"
            value={value}
            onChange={(e) => updateParamValue(fullKey, Number(e.target.value))}
          />
        </div>
      );
    } else if (Array.isArray(value)) {
      return (
        <div key={fullKey} className="param-input">
          <label>{key}:</label>
          <textarea
            value={value.join(', ')}
            onChange={(e) => updateParamValue(fullKey, e.target.value.split(',').map(item => item.trim()))}
            placeholder="Enter comma-separated values"
          />
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div key={fullKey} className="param-group">
          <h4>{key}:</h4>
          {Object.entries(value).map(([k, v]) => renderParamInput(k, v, fullKey))}
        </div>
      );
    } else {
      return (
        <div key={fullKey} className="param-input">
          <label>{key}:</label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateParamValue(fullKey, e.target.value)}
          />
        </div>
      );
    }
  };

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem(`${sdkName.toLowerCase()}_access_token`);
    localStorage.removeItem(`${sdkName.toLowerCase()}_refresh_token`);
    
    // Reset state
    setAccessToken('');
    setRefreshToken('');
    setIsAuthenticated(false);
    setSelectedFunction('');
    setFunctionParams({});
    setResult(null);
    setError(null);
  };

  return (
    <div className="container">
      <h1>{sdkName} SDK Function Tester</h1>
      
      {!isAuthenticated ? (
        <div className="auth-section">
          <button 
            onClick={onInitiateOAuth}
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Authenticate with ${sdkName}`}
          </button>
        </div>
      ) : (
        <div className="tester-container">
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>Functions</h2>
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            </div>
            {Object.entries(functionCategories).map(([category, functions]) => (
              <div key={category} className="category">
                <h3>{category}</h3>
                <ul>
                  {functions.map(func => (
                    <li 
                      key={func.name}
                      className={selectedFunction === func.name ? 'selected' : ''}
                      onClick={() => handleFunctionSelect(func.name)}
                    >
                      {func.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="main-content">
            {selectedFunction ? (
              <>
                <div className="function-header">
                  <h2>{selectedFunction}</h2>
                  <p className="function-description">
                    {Object.values(functionCategories).flat().find(f => f.name === selectedFunction)?.description}
                  </p>
                </div>
                
                <div className="params-section">
                  <h3>Parameters</h3>
                  <div className="params-container">
                    {Object.entries(functionParams).map(([key, value]) => renderParamInput(key, value))}
                  </div>
                  
                  <button 
                    onClick={executeFunction}
                    className="execute-button"
                    disabled={loading}
                  >
                    {loading ? 'Executing...' : 'Execute Function'}
                  </button>
                </div>
                
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                
                {result && (
                  <div className="result-section">
                    <h3>Response:</h3>
                    <pre className="result-json">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="no-function-selected">
                <p>Select a function from the sidebar to test it</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .auth-section {
          display: flex;
          justify-content: center;
          margin: 2rem 0;
        }
        
        .auth-button {
          padding: 10px 20px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .auth-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .tester-container {
          display: flex;
          gap: 2rem;
        }
        
        .sidebar {
          width: 250px;
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 5px;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .category {
          margin-bottom: 1.5rem;
        }
        
        .category h3 {
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        
        .category ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .category li {
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 3px;
        }
        
        .category li:hover {
          background-color: #e0e0e0;
        }
        
        .category li.selected {
          background-color: #0070f3;
          color: white;
        }
        
        .main-content {
          flex: 1;
          background-color: white;
          padding: 1.5rem;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .function-header {
          margin-bottom: 1.5rem;
        }
        
        .function-description {
          color: #666;
          margin-top: 0.5rem;
        }
        
        .params-section {
          margin-bottom: 1.5rem;
        }
        
        .params-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .param-input {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .param-input label {
          font-weight: 500;
        }
        
        .param-input input,
        .param-input textarea {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 3px;
        }
        
        .param-group {
          grid-column: 1 / -1;
          background-color: #f9f9f9;
          padding: 1rem;
          border-radius: 5px;
          margin-bottom: 1rem;
        }
        
        .execute-button {
          padding: 10px 20px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .execute-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .error-message {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 5px;
        }
        
        .result-section {
          margin-top: 1.5rem;
        }
        
        .result-json {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 5px;
          overflow: auto;
          max-height: 400px;
          font-family: monospace;
        }
        
        .no-function-selected {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
          color: #666;
          font-size: 1.2rem;
        }
        
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .logout-button {
          padding: 5px 10px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        
        .logout-button:hover {
          background-color: #d32f2f;
        }
      `}</style>
    </div>
  );
} 