# Universal Package Testing Template

This template provides a universal testing interface for any package that requires OAuth authentication. It's designed to be easily adaptable for testing different packages without creating a new UI for each one.

## Features

- Universal OAuth authentication flow
- Configurable function parameters through JSON input
- Clean and simple interface
- Error handling and result display
- Easy to modify for different packages

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with your OAuth credentials:

```env
NEXT_PUBLIC_[PROVIDER]_CLIENT_ID=your_client_id
NEXT_PUBLIC_[PROVIDER]_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_[PROVIDER]_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_[PROVIDER]_AUTH_URL=https://your-oauth-provider.com/auth
NEXT_PUBLIC_[PROVIDER]_TOKEN_URL=https://your-oauth-provider.com/token
NEXT_PUBLIC_[PROVIDER]_SCOPE=your_required_scopes
```

3. Run the development server:

```bash
npm run dev
```

## How to Use

1. **Authentication**: Click the "Authenticate" button to start the OAuth flow.

2. **Testing Functions**: After authentication:
   - Enter your function parameters in the JSON textarea
   - Click "Test Function" to execute
   - View results or errors in the response section

## Customizing for Your Package

1. **OAuth Configuration**:

   - Update the OAuth endpoints in `.env.local`
   - Modify the `oauthConfig` object in `pages/index.js` if needed

2. **Function Testing**:

   - Modify `pages/api/test-function.js` to implement your package's specific function calls
   - Update the parameter structure in the frontend if needed

3. **Additional Features**:
   - Add more function testing buttons as needed
   - Modify the UI to match your package's requirements
   - Add additional OAuth scopes or parameters

## Example Usage

```javascript
// In pages/api/test-function.js
import { yourPackage } from 'your-package';

export default async function handler(req, res) {
  const { accessToken, params } = req.body;

  try {
    const result = await yourPackage.someFunction(accessToken, params);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

## Notes

- Keep sensitive information in environment variables
- Handle errors appropriately
- Test thoroughly with your specific package
- Update the UI/UX as needed for your use case
