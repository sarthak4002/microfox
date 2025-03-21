import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createYouTubeSDKWithTokens } from '@microfox/youtube-sdk';
import { googleOAuth } from '@microfox/google-sdk';

// Types
interface YouTubeProps {
  tokens: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    isValid: boolean;
  };
  updateTokens: (tokens: any) => void;
}

interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  thumbnailUrl?: string;
  statistics?: {
    viewCount?: string;
    subscriberCount?: string;
    videoCount?: string;
  };
}

interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  publishedAt: string;
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
}

export const YouTube = ({ tokens, updateTokens }: YouTubeProps) => {
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showCreateComment, setShowCreateComment] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoInfo | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [selectedDriveFile, setSelectedDriveFile] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [driveFileContent, setDriveFileContent] = useState<Blob | null>(null);

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

  // Load YouTube channel info
  useEffect(() => {
    if (!tokens.isValid) return;

    const loadChannelInfo = async () => {
      setLoading(true);
      setError('');

      try {
        // Ensure we have a valid token before proceeding
        const currentTokens = await ensureValidToken();

        if (!currentTokens || !currentTokens.isValid) {
          setError('Authentication token is invalid or expired');
          return;
        }

        // Use the Microfox YouTube SDK with possibly refreshed token
        const ytSDK = await createYouTubeSDKWithTokens({
          accessToken: currentTokens.accessToken || '',
          refreshToken: currentTokens.refreshToken || '',
          clientId: localStorage.getItem('clientId') || '',
          clientSecret: localStorage.getItem('clientSecret') || '',
          scopes: [
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
          ],
        });

        // Get channel info
        const channel = await ytSDK.getMyChannel();

        const channelData: ChannelInfo = {
          id: channel.id,
          title: channel.title,
          description: channel.description || '',
          customUrl: channel.customUrl,
          thumbnailUrl: channel.thumbnails?.default?.url,
          statistics: channel.statistics
            ? {
                viewCount: channel.statistics.viewCount,
                subscriberCount: channel.statistics.subscriberCount,
                videoCount: channel.statistics.videoCount,
              }
            : undefined,
        };

        // Get videos from the channel - search only accepts snippet part
        const videosResponse = await ytSDK.listChannelVideos(channel.id, {
          part: 'snippet',
        });

        // Transform the search response to our VideoInfo format
        // The id for search results is inside an id object with videoId property
        const videosList: VideoInfo[] =
          videosResponse.items?.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails?.medium?.url,
            publishedAt: item.snippet.publishedAt,
            statistics: {
              viewCount: '0',
              likeCount: '0',
              commentCount: '0',
            },
          })) || [];

        // If we have video IDs, get more details for each video using separate API call
        if (videosList.length > 0) {
          try {
            // Get video statistics in a single batch request using the new getVideos method
            const videoIds = videosList.map((v: VideoInfo) => v.id);
            const videosDetailsResponse = await ytSDK.getVideos(videoIds, {
              part: 'statistics',
              // fields: "items(id,statistics)"
            });

            // Create a map of video ID to statistics
            const statsMap: Record<string, any> = {};
            if (
              videosDetailsResponse.items &&
              videosDetailsResponse.items.length > 0
            ) {
              videosDetailsResponse.items.forEach((item: any) => {
                statsMap[item.id] = item.statistics;
              });
            }

            // Update videos with statistics
            const detailedVideos = videosList.map((video: VideoInfo) => ({
              ...video,
              statistics: statsMap[video.id] || video.statistics,
            }));

            setVideos(detailedVideos);
          } catch (err) {
            console.error('Error getting video details:', err);
            setVideos(videosList);
          }
        } else {
          setVideos(videosList);
        }

        setChannelInfo(channelData);

        // Load Drive files for uploading
        loadDriveFiles();
      } catch (err: any) {
        console.error('Error loading YouTube data:', err);
        if (err.errors) {
          setError(JSON.stringify(err.errors));
        } else {
          setError(err.message || 'Failed to load YouTube data');
        }

        // If there's a token error, update token state
        if (err.message && err.message.includes('token')) {
          updateTokens({ isValid: false });
        }
      } finally {
        setLoading(false);
      }
    };

    loadChannelInfo();
  }, [tokens.isValid, tokens.accessToken, tokens.refreshToken, updateTokens]);

  // Load Drive files for potential upload
  const loadDriveFiles = async () => {
    if (!tokens.isValid) return;

    try {
      // Make a direct fetch call instead of using the Drive SDK
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=mimeType%20contains%20%27video/%27%20and%20trashed%3Dfalse&fields=files(id,name,mimeType,size,webViewLink)',
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Drive files: ${response.statusText}`);
      }

      const data = await response.json();
      setDriveFiles(data.files || []);
    } catch (err: any) {
      console.error('Error loading Drive files:', err);
    }
  };

  const handleCreateComment = async () => {
    if (!selectedVideo || !commentText) {
      setError('Please select a video and enter a comment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Ensure token is valid before creating comment
      const currentTokens = await ensureValidToken();

      if (!currentTokens || !currentTokens.isValid) {
        setError('Authentication token is invalid or expired');
        return;
      }

      const ytSDK = await createYouTubeSDKWithTokens({
        accessToken: currentTokens.accessToken || '',
        refreshToken: currentTokens.refreshToken || '',
        clientId: localStorage.getItem('clientId') || '',
        clientSecret: localStorage.getItem('clientSecret') || '',
        scopes: [
          'https://www.googleapis.com/auth/youtube',
          'https://www.googleapis.com/auth/youtube.force-ssl',
          'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
          'https://www.googleapis.com/auth/youtubepartner',
        ],
      });

      // Use the addComment method instead of makeRequest
      const response = await ytSDK.addComment(selectedVideo.id, commentText);

      console.log('Comment created:', response);

      setCommentText('');
      setShowCreateComment(false);

      // Show success message
      alert('Comment posted successfully!');
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setError(err.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  // Get file content from Drive - updated to accept token
  const getFileContent = async (
    fileId: string,
    accessToken = tokens.accessToken,
  ): Promise<Blob> => {
    // Make a direct fetch call instead of using the Drive SDK
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch file content: ${response.statusText}`);
    }

    return await response.blob();
  };

  // Upload video from Google Drive to YouTube
  const handleUploadFromDrive = async () => {
    if (!selectedDriveFile || !uploadTitle) {
      setError('Please select a file and provide a title');
      return;
    }

    setUploadLoading(true);
    setError('');

    try {
      // Ensure token is valid before uploading
      const currentTokens = await ensureValidToken();

      if (!currentTokens || !currentTokens.isValid) {
        setError('Authentication token is invalid or expired');
        return;
      }

      // Find the selected file from our list
      const selectedFile = driveFiles.find(
        file => file.id === selectedDriveFile,
      );
      if (!selectedFile) {
        throw new Error('Selected file not found');
      }

      // Get file content from Drive using validated tokens
      const fileBlob = await getFileContent(
        selectedDriveFile,
        currentTokens.accessToken,
      );

      // Initialize YouTube SDK with validated tokens
      const ytSDK = await createYouTubeSDKWithTokens({
        accessToken: currentTokens.accessToken || '',
        refreshToken: currentTokens.refreshToken || '',
        clientId: localStorage.getItem('clientId') || '',
        clientSecret: localStorage.getItem('clientSecret') || '',
        scopes: [
          'https://www.googleapis.com/auth/youtube',
          'https://www.googleapis.com/auth/youtube.force-ssl',
          'https://www.googleapis.com/auth/youtube.upload',
        ],
      });

      // Upload to YouTube
      await ytSDK.uploadVideo({
        title: uploadTitle,
        description:
          uploadDescription ||
          `Uploaded from Google Drive (file: ${selectedFile.name})`,
        privacyStatus: 'private',
        videoFile: fileBlob,
      });

      // Reset form
      setSelectedDriveFile('');
      setUploadTitle('');
      setUploadDescription('');
      setShowUploadForm(false);
      setDriveFileContent(null);

      // Show success message
      alert('Video uploaded successfully to YouTube!');

      // Refresh video list
      const channel = await ytSDK.getMyChannel();
      const videosResponse = await ytSDK.listChannelVideos(channel.id, {
        part: 'snippet',
        // fields: "nextPageToken,pageInfo,items(id,snippet(title,description,channelId,channelTitle,publishedAt,thumbnails))"
      });

      const newVideos =
        videosResponse.items?.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails?.medium?.url,
          publishedAt: item.snippet.publishedAt,
          statistics: {
            viewCount: '0',
            likeCount: '0',
            commentCount: '0',
          },
        })) || [];

      // Get statistics for the new videos
      if (newVideos.length > 0) {
        try {
          const videoIds = newVideos.map((v: VideoInfo) => v.id);
          const videosDetailsResponse = await ytSDK.getVideos(videoIds, {
            part: 'statistics',
            // fields: "items(id,statistics)"
          });

          // Create a map of video ID to statistics
          const statsMap: Record<string, any> = {};
          if (
            videosDetailsResponse.items &&
            videosDetailsResponse.items.length > 0
          ) {
            videosDetailsResponse.items.forEach((item: any) => {
              statsMap[item.id] = item.statistics;
            });
          }

          // Update videos with statistics
          const detailedVideos = newVideos.map((video: VideoInfo) => ({
            ...video,
            statistics: statsMap[video.id] || video.statistics,
          }));

          setVideos(detailedVideos);
        } catch (err) {
          console.error('Error getting video details:', err);
          setVideos(newVideos);
        }
      } else {
        setVideos(newVideos);
      }
    } catch (err: any) {
      console.error('Error uploading video:', err);
      setError(err.message || 'Failed to upload video');
    } finally {
      setUploadLoading(false);
    }
  };

  const formatNumber = (num: string = '0') => {
    const n = parseInt(num, 10);
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M';
    } else if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  if (!tokens.isValid) {
    return (
      <div className="card">
        <h2>Microfox YouTube SDK</h2>
        <p>Please authenticate with Google to use the YouTube SDK.</p>
        <Link to="/oauth">
          <button style={{ marginTop: '1rem' }}>Authenticate Now</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Microfox YouTube SDK</h2>
      <p>
        This demonstrates how to use the @microfox/youtube-sdk to interact with
        the YouTube API.
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

      {loading && !channelInfo ? (
        <p>Loading YouTube data...</p>
      ) : (
        <>
          {/* Channel Info Section */}
          {channelInfo && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#f5f5f5',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginRight: '1rem',
                }}
              >
                <img
                  src={
                    channelInfo.thumbnailUrl || 'https://via.placeholder.com/80'
                  }
                  alt={channelInfo.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3>{channelInfo.title}</h3>
                <p style={{ color: '#777', marginBottom: '0.5rem' }}>
                  {channelInfo.customUrl}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.9rem',
                    color: '#555',
                  }}
                >
                  <span>
                    {formatNumber(channelInfo.statistics?.subscriberCount)}{' '}
                    subscribers
                  </span>
                  <span>
                    {formatNumber(channelInfo.statistics?.videoCount)} videos
                  </span>
                  <span>
                    {formatNumber(channelInfo.statistics?.viewCount)} views
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Videos Section */}
          <div style={{ marginTop: '2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3>Your Videos</h3>
              <div>
                <button
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  style={{ marginRight: '10px' }}
                >
                  {showUploadForm ? 'Cancel Upload' : 'Upload from Drive'}
                </button>
                <button
                  onClick={() => setShowCreateComment(!showCreateComment)}
                >
                  {showCreateComment ? 'Cancel' : 'Post Comment'}
                </button>
              </div>
            </div>

            {/* Upload from Drive Form */}
            {showUploadForm && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f8f8f8',
                  borderRadius: '4px',
                }}
              >
                <h4>Upload Video from Google Drive</h4>
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>
                    Select Drive Video
                  </label>
                  <select
                    value={selectedDriveFile}
                    onChange={e => setSelectedDriveFile(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="">-- Select a video file --</option>
                    {driveFiles.map(file => (
                      <option key={file.id} value={file.id}>
                        {file.name} ({file.mimeType})
                      </option>
                    ))}
                  </select>

                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      marginTop: '10px',
                    }}
                  >
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    placeholder="Enter video title"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />

                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      marginTop: '10px',
                    }}
                  >
                    Video Description
                  </label>
                  <textarea
                    value={uploadDescription}
                    onChange={e => setUploadDescription(e.target.value)}
                    placeholder="Enter video description"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      minHeight: '100px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />

                  <button
                    onClick={handleUploadFromDrive}
                    style={{ marginTop: '0.5rem' }}
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload to YouTube'}
                  </button>
                </div>
              </div>
            )}

            {/* Comment Form */}
            {showCreateComment && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f8f8f8',
                  borderRadius: '4px',
                }}
              >
                <h4>Post a Comment</h4>
                <div style={{ marginTop: '0.5rem' }}>
                  <select
                    value={selectedVideo?.id || ''}
                    onChange={e => {
                      const video = videos.find(v => v.id === e.target.value);
                      if (video) setSelectedVideo(video);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="">-- Select a video --</option>
                    {videos.map(video => (
                      <option key={video.id} value={video.id}>
                        {video.title}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Your comment"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      minHeight: '100px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                  <button
                    onClick={handleCreateComment}
                    style={{ marginTop: '0.5rem' }}
                    disabled={loading}
                  >
                    {loading ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            )}

            {/* Videos List */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              {videos.length > 0 ? (
                videos.map(video => (
                  <div
                    key={video.id}
                    style={{
                      background: '#fff',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid #eee',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div
                      style={{
                        height: '140px',
                        background: '#f5f5f5',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={
                          video.thumbnailUrl ||
                          'https://via.placeholder.com/320x180'
                        }
                        alt={video.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    <div style={{ padding: '0.75rem' }}>
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                        {video.title}
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: '#777',
                        }}
                      >
                        <span>
                          {formatNumber(video.statistics?.viewCount)} views
                        </span>
                        <span>
                          {formatNumber(video.statistics?.likeCount)} likes
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>
                  No videos found. Use the "Upload from Drive" button to add
                  videos.
                </p>
              )}
            </div>
          </div>

          {/* Selected Video Details */}
          {selectedVideo && (
            <div
              style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#f8f8f8',
                borderRadius: '8px',
              }}
            >
              <h3>{selectedVideo.title}</h3>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  color: '#777',
                  marginTop: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}
              >
                <span>
                  {new Date(selectedVideo.publishedAt).toLocaleDateString()}
                </span>
                <span>
                  {formatNumber(selectedVideo.statistics?.viewCount)} views
                </span>
                <span>
                  {formatNumber(selectedVideo.statistics?.likeCount)} likes
                </span>
                <span>
                  {formatNumber(selectedVideo.statistics?.commentCount)}{' '}
                  comments
                </span>
              </div>
              <p>{selectedVideo.description}</p>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>Microfox YouTube SDK Code Example</h3>
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
import { createYouTubeSDKWithTokens } from '@microfox/youtube-sdk';

// Initialize with tokens
const youtube = await createYouTubeSDKWithTokens({
  accessToken: '${tokens?.accessToken?.substring(0, 10)}...',
  refreshToken: '${tokens?.refreshToken?.substring(0, 10) || 'your-refresh-token'}...',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  scopes: [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.force-ssl",
    "https://www.googleapis.com/auth/youtube.upload"
  ]
});

// Get your channel info
const myChannel = await youtube.getMyChannel();

// Post a comment on a video
await youtube.addComment('VIDEO_ID', 'This is an awesome video!');

// Upload video from Drive to YouTube
const drive = await createDriveSDKWithTokens({
  accessToken: '${tokens?.accessToken?.substring(0, 10)}...',
  refreshToken: '${tokens?.refreshToken?.substring(0, 10) || 'your-refresh-token'}...',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.readonly"
  ]
});

// Get the file from Drive
const fileBlob = await drive.downloadFile('DRIVE_FILE_ID');

// Upload to YouTube
await youtube.uploadVideo({
  title: 'My awesome video',
  description: 'Uploaded from Google Drive',
  privacyStatus: 'private',
  videoFile: fileBlob
});`}
        </pre>
      </div>
    </div>
  );
};

export default YouTube;
