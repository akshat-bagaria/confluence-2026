# MongoDB Atlas setup for registrations

The form posts to the same-site Astro API route `/api/register`. The server validates the submitted team and stores it in the MongoDB `confluence.registrations` collection. The MongoDB connection string is used only on the server and is never sent to the browser.

## Set up MongoDB Atlas

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with a strong password and read/write access only to the `confluence` database.
3. In Atlas **Network Access**, allow the IP addresses from which your app will connect. For local development, add your current IP. For Vercel, use static outbound IPs if they are available on your plan; do not expose the database publicly without understanding the risk.
4. Choose **Connect → Drivers → Node.js** and copy the connection string. Replace the username, password, and cluster host. URL-encode special characters in the password.
5. Put the real connection string in the ignored local `.env` file:

   ```env
   MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER/confluence?retryWrites=true&w=majority
   MONGODB_DB=confluence
   ```

6. In Vercel, open **Project → Settings → Environment Variables** and add `MONGODB_URI` and `MONGODB_DB` for Preview and Production. Then redeploy.

## View registrations

In Atlas, open **Database → Browse Collections → confluence → registrations**. Each registration is one document containing the team details, member SRNs, selected track, idea, and submission time.

Never use a `PUBLIC_` prefix for the MongoDB URI, and do not commit `.env` to Git.
