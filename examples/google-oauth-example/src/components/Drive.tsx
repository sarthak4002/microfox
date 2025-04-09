import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createDriveSDKWithTokens } from '@microfox/drive';
import { googleOAuth } from '@microfox/google';

// Types
interface DriveProps {
  tokens: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    isValid: boolean;
  };
  updateTokens: (tokens: any) => void;
}

interface FileData {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  webViewLink?: string;
}

export const Drive = ({ tokens, updateTokens }: DriveProps) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'My Drive' },
  ]);

  const ensureValidToken = async () => {
    try {
      if (!tokens.accessToken) {
        console.log('No access token found');
        return false;
      }

      if (!tokens.expiresAt || tokens.expiresAt < Date.now()) {
        console.log('Token expired, attempting to refresh');

        if (!tokens.refreshToken) {
          console.log('Missing refresh token');
          updateTokens({ ...tokens, isValid: false });
          return false;
        }

        const clientId = localStorage.getItem('clientId');
        const clientSecret = localStorage.getItem('clientSecret');

        if (!clientId || !clientSecret) {
          console.log('Missing client credentials');
          updateTokens({ ...tokens, isValid: false });
          return false;
        }

        const refreshResult = await googleOAuth.refreshAccessToken(
          tokens.refreshToken,
          clientId,
          clientSecret,
        );

        if (refreshResult && refreshResult.isValid) {
          updateTokens(refreshResult);
          console.log('Token refreshed successfully');
          return refreshResult;
        } else {
          console.log('Failed to refresh token:', refreshResult?.errorMessage);
          updateTokens({ ...tokens, isValid: false });
          return false;
        }
      }

      return { ...tokens, isValid: true };
    } catch (error) {
      console.error('Error ensuring valid token:', error);
      updateTokens({ ...tokens, isValid: false });
      return false;
    }
  };

  useEffect(() => {
    if (!tokens.isValid) return;

    const loadFiles = async () => {
      setLoading(true);
      setError('');

      try {
        const currentTokens = await ensureValidToken();

        if (!currentTokens || !currentTokens.isValid) {
          setError('Authentication token is invalid or expired');
          return;
        }

        const driveSDK = await createDriveSDKWithTokens({
          accessToken: currentTokens.accessToken || '',
          refreshToken: currentTokens.refreshToken || '',
          clientId: (localStorage.getItem('clientId') || '') as string,
          clientSecret: (localStorage.getItem('clientSecret') || '') as string,
          scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive.metadata.readonly',
          ],
        });

        const query =
          currentFolderId === 'root'
            ? "'root' in parents and trashed=false"
            : `'${currentFolderId}' in parents and trashed=false`;

        const response = await driveSDK.listFiles({
          query,
        });

        if (response.files) {
          setFiles(response.files);
        } else {
          setFiles([]);
        }
      } catch (err: any) {
        console.error('Error loading files:', err);
        setError(err.message || 'Failed to load Drive files');

        if (err.message && err.message.includes('token')) {
          updateTokens({ ...tokens, isValid: false });
        }
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [
    tokens.isValid,
    tokens.accessToken,
    tokens.refreshToken,
    updateTokens,
    currentFolderId,
  ]);

  const handleFileSelect = async (file: FileData) => {
    setSelectedFile(file);
    setFileContent(null);

    if (file.mimeType === 'application/vnd.google-apps.folder') {
      setFolderPath(prevPath => [
        ...prevPath,
        { id: file.id, name: file.name },
      ]);
      setCurrentFolderId(file.id);
      return;
    }

    if (
      file.mimeType === 'text/plain' ||
      file.mimeType === 'application/json' ||
      file.mimeType.includes('text/') ||
      file.mimeType.includes('application/xml')
    ) {
      try {
        setLoading(true);
        const currentTokens = await ensureValidToken();

        if (!currentTokens || !currentTokens.isValid) {
          setError('Authentication token is invalid or expired');
          return;
        }

        const driveSDK = await createDriveSDKWithTokens({
          accessToken: currentTokens.accessToken || '',
          refreshToken: currentTokens.refreshToken || '',
          clientId: localStorage.getItem('clientId') || '',
          clientSecret: localStorage.getItem('clientSecret') || '',
          scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
          ],
        });

        const blob = await driveSDK.downloadFile(file.id);
        const text = await blob.text();
        setFileContent(text);
      } catch (err: any) {
        console.error('Error downloading file:', err);
        setFileContent(`[Error downloading file: ${err.message}]`);
      } finally {
        setLoading(false);
      }
    } else {
      setFileContent(
        `[${file.mimeType} content cannot be displayed directly. Click the link to open in Google Drive.]`,
      );
    }
  };

  const navigateToFolder = (index: number) => {
    if (index >= folderPath.length) return;

    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1].id);
    setSelectedFile(null);
    setFileContent(null);
  };

  const handleCreateFile = async () => {
    if ((!uploadName || !uploadContent) && !uploadFile) {
      setError(
        'Please provide a file or enter a name and content for a text file',
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const currentTokens = await ensureValidToken();
      if (!currentTokens || !currentTokens.isValid) {
        setError('Invalid or expired token. Please sign in again.');
        setLoading(false);
        return;
      }

      const driveSDK = await createDriveSDKWithTokens({
        accessToken: currentTokens.accessToken || '',
        refreshToken: currentTokens.refreshToken || '',
        clientId: localStorage.getItem('clientId') || '',
        clientSecret: localStorage.getItem('clientSecret') || '',
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });

      let newFile;

      if (uploadFile) {
        newFile = await driveSDK.createFile({
          name: uploadFile.name,
          content: uploadFile,
          mimeType: uploadFile.type || 'application/octet-stream',
          parents: [currentFolderId],
        });
      } else {
        const fileName = uploadName.endsWith('.txt')
          ? uploadName
          : `${uploadName}.txt`;

        newFile = await driveSDK.createFile({
          name: fileName,
          content: new Blob([uploadContent], { type: 'text/plain' }),
          mimeType: 'text/plain',
          parents: [currentFolderId],
        });
      }

      if (newFile) {
        setFiles(prev => [newFile, ...prev]);
        setUploadName('');
        setUploadContent('');
        setUploadFile(null);
        setShowUpload(false);

        setSelectedFile(newFile);
        if (!uploadFile || uploadFile.type.includes('text/')) {
          setFileContent(uploadFile ? await uploadFile.text() : uploadContent);
        } else {
          setFileContent(
            `[${newFile.mimeType} content cannot be displayed directly. Click the link to open in Google Drive.]`,
          );
        }
      }
    } catch (err: any) {
      console.error('Error creating file:', err);
      setError(err.message || 'Failed to create file');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (size?: string) => {
    if (!size) return '';

    const bytes = parseInt(size, 10);
    if (isNaN(bytes)) return size;

    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') return '📁';
    if (mimeType.includes('image/')) return '🖼️';
    if (mimeType.includes('video/')) return '🎬';
    if (mimeType.includes('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('presentation')) return '📑';
    if (mimeType.includes('document') || mimeType.includes('text/'))
      return '📝';
    return '📄';
  };

  if (!tokens.isValid) {
    return (
      <div className="card">
        <h2>Microfox Drive SDK</h2>
        <p>Please authenticate with Google to use the Drive SDK.</p>
        <Link to="/oauth">
          <button style={{ marginTop: '1rem' }}>Authenticate Now</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Microfox Drive SDK</h2>
      <p>
        This demonstrates how to use the @microfox/drive to interact with Google
        Drive.
      </p>

      {error && (
        <div
          style={{
            color: 'red',
            marginTop: '1rem',
            padding: '10px',
            background: '#ffeeee',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '1rem',
          overflowX: 'auto',
          padding: '0.5rem 0',
        }}
      >
        <div style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
          Location:
        </div>
        {folderPath.map((folder, index) => (
          <div
            key={folder.id}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <span
              onClick={() => navigateToFolder(index)}
              style={{
                cursor: 'pointer',
                color: '#0366d6',
                textDecoration:
                  index === folderPath.length - 1 ? 'none' : 'underline',
              }}
            >
              {folder.name}
            </span>
            {index < folderPath.length - 1 && (
              <span style={{ margin: '0 0.5rem' }}>/</span>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1rem',
        }}
      >
        <h3>Files and Folders</h3>
        <button onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? 'Cancel' : 'Create New File'}
        </button>
      </div>

      {showUpload && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f8f8f8',
            borderRadius: '4px',
          }}
        >
          <h4>Upload or Create a File</h4>
          <div style={{ marginTop: '0.5rem' }}>
            <div
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: '#f0f0f0',
                borderRadius: '4px',
              }}
            >
              <h5 style={{ marginTop: 0 }}>Upload Local File</h5>
              <input
                type="file"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadFile(e.target.files[0]);
                    setUploadName('');
                    setUploadContent('');
                  }
                }}
                style={{ marginBottom: '0.5rem' }}
              />
              {uploadFile && (
                <div style={{ fontSize: '0.9rem' }}>
                  Selected file: {uploadFile.name} (
                  {uploadFile.type || 'unknown type'},{' '}
                  {formatSize(uploadFile.size?.toString())})
                </div>
              )}
            </div>

            <div
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: '#f0f0f0',
                borderRadius: '4px',
              }}
            >
              <h5 style={{ marginTop: 0 }}>OR Create Text File</h5>
              <input
                type="text"
                placeholder="File name (e.g. notes.txt)"
                value={uploadName}
                onChange={e => {
                  setUploadName(e.target.value);
                  if (uploadFile) setUploadFile(null);
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              <textarea
                placeholder="File content"
                value={uploadContent}
                onChange={e => {
                  setUploadContent(e.target.value);
                  if (uploadFile) setUploadFile(null);
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  minHeight: '100px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
            <button
              onClick={handleCreateFile}
              style={{ marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload to Drive'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ flex: '1 1 50%' }}>
          {loading && !files.length ? (
            <p>Loading files...</p>
          ) : files.length > 0 ? (
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr
                    style={{
                      position: 'sticky',
                      top: 0,
                      background: '#f8f8f8',
                    }}
                  >
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      Type
                    </th>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      Size
                    </th>
                    <th
                      style={{
                        padding: '0.75rem',
                        textAlign: 'left',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {files.map(file => (
                    <tr
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      style={{
                        cursor: 'pointer',
                        background:
                          selectedFile?.id === file.id
                            ? '#f0f0f0'
                            : 'transparent',
                      }}
                      onMouseOver={e =>
                        (e.currentTarget.style.background = '#f5f5f5')
                      }
                      onMouseOut={e =>
                        (e.currentTarget.style.background =
                          selectedFile?.id === file.id
                            ? '#f0f0f0'
                            : 'transparent')
                      }
                    >
                      <td
                        style={{
                          padding: '0.75rem',
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        {getFileIcon(file.mimeType)} {file.name}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        {file.mimeType
                          .split('/')
                          .pop()
                          ?.replace('vnd.google-apps.', '')}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        {formatSize(file.size)}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        {formatDate(file.createdTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No files found in this folder.</p>
          )}
        </div>

        <div style={{ flex: '1 1 50%' }}>
          {selectedFile ? (
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '1rem',
                height: '400px',
                overflowY: 'auto',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <h4>{selectedFile.name}</h4>
                {selectedFile.webViewLink && (
                  <a
                    href={selectedFile.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0366d6', textDecoration: 'none' }}
                  >
                    Open in Google Drive →
                  </a>
                )}
              </div>

              {loading ? (
                <p>Loading file content...</p>
              ) : (
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    maxHeight: '300px',
                    overflow: 'auto',
                    padding: '0.5rem',
                    background: '#f8f8f8',
                    borderRadius: '4px',
                  }}
                >
                  {fileContent}
                </pre>
              )}
            </div>
          ) : (
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '1rem',
                height: '400px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#666',
              }}
            >
              Select a file to view its details
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Microfox Drive SDK Code Example</h3>
        <pre
          style={{
            textAlign: 'left',
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
            overflowX: 'auto',
          }}
        >
          {`// Import the SDK
import { createDriveSDKWithTokens } from '@microfox/drive';

// Initialize with tokens
const drive = await createDriveSDKWithTokens({
  accessToken: '${tokens?.accessToken?.substring(0, 10)}...',
  refreshToken: '${tokens?.refreshToken?.substring(0, 10) || 'your-refresh-token'}...',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata.readonly"
  ]
});

// List files in a folder
const files = await drive.listFiles({
  query: "'root' in parents and trashed=false",
  // fields: "id,name,mimeType,size,createdTime,webViewLink"
});

// Download a file
const fileContent = await drive.downloadFile('file-id');

// Create a new text file
const newFile = await drive.createFile({
  name: 'My Document.txt',
  content: 'This is the content of my document',
  mimeType: 'text/plain',
  parents: ['folder-id']
});`}
        </pre>
      </div>
    </div>
  );
};

export default Drive;
