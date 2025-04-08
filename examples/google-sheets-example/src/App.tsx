import React, { useState, useEffect } from 'react';
import { createGoogleSheetsSDK, GoogleSheetsSDK, GoogleSheetsSDKOptions } from "@microfox/google-sheets";

const App = () => {
  // State variables
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUri, setRedirectUri] = useState(window.location.origin);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [sheetsClient, setSheetsClient] = useState<GoogleSheetsSDK | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [range, setRange] = useState('Sheet1!A1:D10');
  const [authCode, setAuthCode] = useState('');
  const [sheetData, setSheetData] = useState<string[][]>([[]]);
  const [status, setStatus] = useState('');
  const [newValues, setNewValues] = useState('');

  // Check for auth code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    console.log("Code: ", code);
    if (code) {
      setAuthCode(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Initialize SDK
  const initializeSDK = () => {
    try {
      setStatus('Initializing SDK...');
      const options: GoogleSheetsSDKOptions = {
        clientId,
        clientSecret,
        redirectUri,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        accessToken: accessToken || undefined,
        refreshToken: refreshToken || undefined
      };
      
      const sdk = createGoogleSheetsSDK(options);
      setSheetsClient(sdk);
      
      // Generate auth URL
      const url = sdk.generateAuthUrl();
      setAuthUrl(url);
      setStatus('SDK initialized. Auth URL generated.');
    } catch (error:any) {
      setStatus(`Error initializing SDK: ${error.message}`);
    }
  };

  // Exchange auth code for tokens
  const exchangeCodeForTokens = async () => {
    console.log("Exchanging code for tokens... ", sheetsClient, authCode);
    if (!sheetsClient || !authCode) {
      setStatus('No SDK instance or auth code available');
      console.log("No SDK instance or auth code available");
      return;
    }

    try {
      setStatus('Exchanging code for tokens...');
      const tokens = await sheetsClient.exchangeCodeForTokens(authCode);
      console.log(tokens);
      setAccessToken(tokens.access_token);
      if (tokens.refresh_token) {
        setRefreshToken(tokens.refresh_token);
      }
      setStatus('Successfully retrieved tokens!');
    } catch (error:any) {
      console.log("Error exchanging code: ", error);
      setStatus(`Error exchanging code: ${error.message}`);
    }
  };

  // Fetch data from sheet
  const fetchSheetData = async () => {
    if (!sheetsClient) {
      setStatus('No SDK instance available');
      return;
    }

    try {
      setStatus(`Fetching data from range ${range}...`);
      const response = await sheetsClient.getValues(spreadsheetId, range);
      setSheetData(response.values || []);
      setStatus(`Data fetched successfully from ${response.range}`);
    } catch (error:any) {
      setStatus(`Error fetching data: ${error.message}`);
    }
  };

  // Update sheet data
  const updateSheetData = async () => {
    console.log("Updating sheet data... ", sheetsClient, newValues);
    if (!sheetsClient) {
      setStatus('No SDK instance available');
      return;
    }

    try {
      // Parse newValues as a 2D array
      const values = newValues.split('\n')
        .map(row => row.split(',').map(cell => cell.trim()));
      
      setStatus(`Updating range ${range} with new values...`);
      const response = await sheetsClient.updateValues(spreadsheetId, range, values);
      setStatus(`Update successful! Updated ${response.updatedCells} cells.`);
      
      // Refresh data after update
      fetchSheetData();
    } catch (error:any) {
      console.log("Error updating data: ", error);
      setStatus(`Error updating data: ${error.message}`);
    }
  };

  // Append data to sheet
  const appendSheetData = async () => {
    if (!sheetsClient) {
      setStatus('No SDK instance available');
      return;
    }

    try {
      // Parse newValues as a 2D array
      const values = newValues.split('\n')
        .map(row => row.split(',').map(cell => cell.trim()));
      
      setStatus(`Appending values after range ${range}...`);
      const response = await sheetsClient.appendValues(spreadsheetId, range, values);
      setStatus(`Append successful! Updated range: ${response.updates.updatedRange}`);
      
      // Refresh data after append
      fetchSheetData();
    } catch (error:any) {
      setStatus(`Error appending data: ${error.message}`);
    }
  };

  // Clear sheet data
  const clearSheetData = async () => {
    if (!sheetsClient) {
      setStatus('No SDK instance available');
      return;
    }

    try {
      setStatus(`Clearing range ${range}...`);
      const response = await sheetsClient.clearValues(spreadsheetId, range);
      setStatus(`Clear successful! Cleared range: ${response.clearedRange}`);
      
      // Refresh data after clear
      fetchSheetData();
    } catch (error:any) {
      setStatus(`Error clearing data: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Google Sheets SDK Test UI</h1>
      
      {/* Configuration Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Client ID:</label>
            <input 
              type="text" 
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your Google API Client ID"
            />
          </div>
          
          <div>
            <label className="block mb-1">Client Secret:</label>
            <input 
              type="password" 
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your Google API Client Secret"
            />
          </div>
          
          <div>
            <label className="block mb-1">Redirect URI:</label>
            <input 
              type="text" 
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Redirect URI (default: current origin)"
            />
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={initializeSDK}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Initialize SDK
            </button>
          </div>
        </div>
      </div>
      
      {/* Authentication Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        
        {authUrl && (
          <div className="mb-4">
            <label className="block mb-1">Auth URL:</label>
            <div className="flex">
              <input 
                type="text" 
                value={authUrl}
                readOnly
                className="w-full p-2 border rounded"
              />
              <button 
                onClick={() => window.open(authUrl, '_blank')}
                className="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Open
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block mb-1">Auth Code:</label>
          <div className="flex">
            <input 
              type="text" 
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Code from redirect URL"
            />
            <button 
              onClick={exchangeCodeForTokens}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={!authCode}
            >
              Exchange
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Access Token:</label>
            <input 
              type="text" 
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Access token will appear here"
            />
          </div>
          
          <div>
            <label className="block mb-1">Refresh Token:</label>
            <input 
              type="text" 
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Refresh token will appear here"
            />
          </div>
        </div>
      </div>
      
      {/* Spreadsheet Operations Section */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Spreadsheet Operations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1">Spreadsheet ID:</label>
            <input 
              type="text" 
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter spreadsheet ID"
            />
          </div>
          
          <div>
            <label className="block mb-1">Range:</label>
            <input 
              type="text" 
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., Sheet1!A1:D10"
            />
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={fetchSheetData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={!spreadsheetId || !range}
          >
            Fetch Data
          </button>
          
          <button 
            onClick={updateSheetData}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            disabled={!spreadsheetId || !range || !newValues}
          >
            Update
          </button>
          
          <button 
            onClick={appendSheetData}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={!spreadsheetId || !range || !newValues}
          >
            Append
          </button>
          
          <button 
            onClick={clearSheetData}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            disabled={!spreadsheetId || !range}
          >
            Clear
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">New Values (comma-separated values, new line for rows):</label>
          <textarea 
            value={newValues}
            onChange={(e) => setNewValues(e.target.value)}
            className="w-full p-2 border rounded h-24"
            placeholder="value1, value2, value3&#10;value4, value5, value6"
          />
        </div>
      </div>
      
      {/* Status & Results Section */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Status & Results</h2>
        
        <div className="mb-4">
          <label className="block mb-1">Status:</label>
          <div className="p-2 border rounded bg-white min-h-12">
            {status || 'No operations performed yet'}
          </div>
        </div>
        
        <div>
          <label className="block mb-1">Sheet Data:</label>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-200">
                  {sheetData[0]?.map((_, idx) => (
                    <th key={idx} className="p-2 border">Column {idx + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheetData.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="p-2 border">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {!sheetData.length && (
              <div className="p-4 text-center text-gray-500">
                No data to display. Fetch data from a sheet first.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;