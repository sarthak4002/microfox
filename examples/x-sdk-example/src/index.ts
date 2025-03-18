const { createXSDK} = require('@microfox/x-sdk');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize the SDK with API credentials
const createXClient = () => {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    throw new Error('X API credentials are required (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET)');
  }

  return createXSDK({
    apiKey,
    apiSecret,
    accessToken,
    accessSecret,
  });
};

// Example of using different X SDK operations
async function xSDKExamples() {
  try {
    console.log('Initializing X SDK...');
    const xSDK = createXClient();

    // User operations examples
    console.log('\n--- User Operations ---');
    
    // Get user by username with expansions
    const userResponse = await xSDK.users.getByUsername('elonmusk', {
      expansions: ['pinned_tweet_id']
    });
    console.log('User lookup result:', userResponse.data?.username);
    console.log('User data:', userResponse.data); 

    // Get authenticated user
    const meResponse = await xSDK.users.getMe();
    console.log('Authenticated user:', meResponse.data?.username);
    
    // Get multiple users by usernames
    console.log('\nLooking up multiple users...');
    const multipleUsers = await xSDK.users.getByUsernames(['elonmusk', 'spacex']);
    console.log(`Found ${multipleUsers.data?.length} users`);
    
    // Tweet operations examples
    console.log('\n--- Tweet Operations ---');
    
    // // Create a tweet
    const tweetResponse = await xSDK.tweets.create({
      text: 'Hello world! Testing the X SDK at ' + new Date().toISOString(),
      for_super_followers_only: false,
      nullcast: false
    });
    console.log('Tweet response:', tweetResponse);
    
    // // Get a tweet by ID with expansions
    if (tweetResponse.id) {
      const fetchedTweet = await xSDK.tweets.get(tweetResponse.id, {
        expansions: ['author_id', 'attachments.media_keys']
      });
      console.log('Fetched tweet text:', fetchedTweet.data?.text);
    
      // Delete the tweet
      const deleteResponse = await xSDK.tweets.delete(tweetResponse.id);
      console.log('Tweet deleted:', deleteResponse.data?.deleted);
    }


    // Media operations example
    console.log('\n--- Media Operations ---');
    
    // Check if test image exists before trying to upload
    const testImagePath = path.join(__dirname, './test-image.png');
    if (fs.existsSync(testImagePath)) {
      const imageBuffer = fs.readFileSync(testImagePath);
      console.log('Uploading test image...');
      
      // Upload media
      const mediaResponse = await xSDK.media.upload(imageBuffer, 'image/png');
      console.log('Uploaded media ID:', mediaResponse.media_id_string);
      
      // Create a tweet with the uploaded media
      if (mediaResponse.media_id_string) {
        const mediaTweet = await xSDK.tweets.create({
          text: 'Testing media upload with the X SDK at ' + new Date().toISOString(),
          for_super_followers_only: false,
          nullcast: false,
          media: {
            media_ids: [mediaResponse.media_id_string]
          }
        });
        console.log('Created media tweet ID:', mediaTweet.id);
        
        // Delete the media tweet
        if (mediaTweet.id) {
          await xSDK.tweets.delete(mediaTweet.id);
          console.log('Media tweet deleted');
        }
      }
    } else {
      console.log(`Media upload skipped - create a file at ${testImagePath} to test this feature`);
    }

    console.log('\nAll examples completed successfully!');
  } catch (error) {
    console.error('Error in X SDK examples:', error);
  }
}

// Example of error handling with the error classes
async function errorHandlingExample() {
  const xSDK = createXClient();
  
  try {
    // Try to get a non-existent user
    const response = await xSDK.users.getByUsername('thisuserprobablydoesnotexist12345678');
    console.log('User found:', response);
  } catch (error: any) {
    console.error('\n--- Error Handling Example ---');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error response:', error);
    // Check for specific error types
    if (error.name === 'XUserError') {
      console.error('This is a user-specific error from the X API');
      console.error('Status code:', error.statusCode);
      if (error.errors) {
        console.error('API error details:', error.errors);
      }
    }
  }
  
  try {
    // Try to use an invalid tweet ID format
    await xSDK.tweets.get('not-a-valid-id');
  } catch (error: any) {
    console.error('\nTweet error example:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
  }
}

xSDKExamples();
// errorHandlingExample();

// export {
//   xSDKExamples,
//   createXClient,
//   errorHandlingExample,
// };
