# Google Sheets Database Setup guide

If your Login or Sign In features work in the **Dev Preview** but fail in the **Shared Link**, please follow these steps to fix your Google Script permissions:

## 1. Open your Google Script
Go to the Google Sheet you are using as a database, and click **Extensions > Apps Script**.

## 2. Update Deployment
1. Click the blue **Deploy** button at the top right.
2. Select **Manage deployments**.
3. Click the **Pencil (Edit)** icon next to your Active deployment.
4. Update the following settings:
   - **Execute as:** `Me` (This ensures the script runs as you, accessing your sheet).
   - **Who has access:** `Anyone` (This allows visitors of your shared link to log in).
5. Click **Deploy**.

## 3. Authorize Access
After clicking Deploy, Google may ask you to "Authorize" the script. Even if it says "Google hasn't verified this app," click **Advanced** and then **Go to [Project Name] (unsafe)** to grant permissions.

---

Once these steps are done, your shared users will be able to register and log in successfully!
