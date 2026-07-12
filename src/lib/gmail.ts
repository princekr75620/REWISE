import { GoogleAuthProvider, signInWithPopup, auth } from './firebase';

// In-memory access token cache
let cachedAccessToken: string | null = null;
let cachedEmail: string | null = null;

// Listen to auth state changes to clear access token on logout
auth.onAuthStateChanged((user) => {
  if (!user) {
    cachedAccessToken = null;
    cachedEmail = null;
  } else {
    // If we have cached email match but user changed, clear
    if (cachedEmail && cachedEmail !== user.email) {
      cachedAccessToken = null;
      cachedEmail = null;
    }
  }
});

/**
 * Trigger authentic Google Sign-In asking specifically for Gmail permissions
 */
export async function authenticateGmail(): Promise<{ email: string; token: string }> {
  try {
    const provider = new GoogleAuthProvider();
    
    // Add Gmail full access and standard scopes that were approved
    provider.addScope('https://mail.google.com/');
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
    provider.addScope('https://www.googleapis.com/auth/gmail.send');
    provider.addScope('https://www.googleapis.com/auth/gmail.compose');
    provider.addScope('https://www.googleapis.com/auth/gmail.modify');

    // Trigger explicit popup authentication
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential || !credential.accessToken) {
      throw new Error("Handshake failed. Google OAuth failed to produce an Access Token on client.");
    }

    cachedAccessToken = credential.accessToken;
    cachedEmail = result.user.email;

    return {
      email: result.user.email || 'authenticated_user',
      token: cachedAccessToken
    };
  } catch (error: any) {
    console.error("Gmail authorization failed:", error);
    throw error;
  }
}

/**
 * Get the currently cached access token
 */
export function getGmailToken(): string | null {
  return cachedAccessToken;
}

/**
 * Fetch a list of user's latest emails with details mapped
 */
export async function getGmailInbox(limit: number = 10, searchTerm: string = ''): Promise<any[]> {
  const token = getGmailToken();
  if (!token) {
    throw new Error("Authentication required. Access token has expired or is invalid.");
  }

  try {
    // 1. Get messages list
    let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}`;
    if (searchTerm) {
      url += `&q=${encodeURIComponent(searchTerm)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Failed to list Gmail inbox messages.");
    }

    const data = await response.json();
    if (!data.messages || data.messages.length === 0) {
      return [];
    }

    // 2. Fetch individual message details in parallel (max 10)
    const detailedMessages = await Promise.all(
      data.messages.map(async (msg: { id: string }) => {
        try {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!detailRes.ok) return null;
          return await detailRes.json();
        } catch (e) {
          console.warn(`Failed fetching detail for message ${msg.id}:`, e);
          return null;
        }
      })
    );

    // Filter out nulls and format
    return detailedMessages
      .filter(Boolean)
      .map((msg: any) => {
        const headers = msg.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
        const to = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || '';

        return {
          id: msg.id,
          threadId: msg.threadId,
          subject,
          from,
          to,
          date: date ? new Date(date).toLocaleString() : 'N/A',
          timestamp: msg.internalDate ? parseInt(msg.internalDate) : Date.now(),
          snippet: msg.snippet || '',
          labels: msg.labelIds || [],
          snippetBody: parseEmailBody(msg)
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

  } catch (error: any) {
    console.error("Failed loading Gmail messages:", error);
    throw error;
  }
}

/**
 * Send an email using base64 envelope transmission required by Gmail API
 */
export async function sendGmailMessage(to: string, subject: string, bodyText: string): Promise<any> {
  const token = getGmailToken();
  if (!token) {
    throw new Error("Authentication required. Sign in is required.");
  }

  // Construct raw mime-type envelope
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyText.replace(/\n/g, '<br/>')
  ];

  const rawEmail = emailLines.join('\r\n');
  const base64SafeRaw = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64SafeRaw
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Failed to deliver email through Gmail nodes.");
    }

    return await response.json();
  } catch (err: any) {
    console.error("Gmail Send Error:", err);
    throw err;
  }
}

/**
 * Delete / trash a message by id (mutating operation, will trigger dialog first on client)
 */
export async function trashGmailMessage(id: string): Promise<boolean> {
  const token = getGmailToken();
  if (!token) {
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error("Failed to move message to trash.");
    }
    return true;
  } catch (error) {
    console.error("Trash failed:", error);
    throw error;
  }
}

/**
 * Helper: Parse the actual email body from parts recursively
 */
function parseEmailBody(message: any): string {
  if (!message.payload) return '';
  
  const bodyData = message.payload.body?.data;
  if (bodyData) {
    return decodeBase64(bodyData);
  }

  // Handle multipart messages
  if (message.payload.parts) {
    const textPart = findTextPart(message.payload.parts);
    if (textPart && textPart.body?.data) {
      return decodeBase64(textPart.body.data);
    }
  }

  return message.snippet || '';
}

function findTextPart(parts: any[]): any {
  for (const part of parts) {
    if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
      return part;
    }
    if (part.parts) {
      const nested = findTextPart(part.parts);
      if (nested) return nested;
    }
  }
  return null;
}

function decodeBase64(base64: string): string {
  try {
    const clean = base64.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(clean)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    try {
      return atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (_) {
      return '';
    }
  }
}
