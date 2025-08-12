// src/utils/authDiagnostic.ts
import { supabase } from "@/services/supabaseClient";

export const diagnoseAuthConfig = async () => {
  try {
    // Check if Supabase client is configured
    await supabase.auth.getSession();
    console.log("✅ Supabase client initialized");

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("🔧 Environment check:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlValid: supabaseUrl?.includes("supabase"),
    });

    return {
      clientOk: true,
      environmentOk: !!supabaseUrl && !!supabaseKey,
      settingsOk: true,
    };
  } catch (error) {
    console.error("❌ Auth diagnostic failed:", error);
    return {
      clientOk: false,
      environmentOk: false,
      settingsOk: false,
      error,
    };
  }
};

// Possible reasons for email not sending
export const emailDeliveryChecklist = () => {
  console.log(`
📧 EMAIL DELIVERY CHECKLIST:

1. ✅ Supabase Project Settings:
   - Go to Authentication > Settings in Supabase Dashboard
   - Check "Enable email confirmations" is ON
   - Verify Site URL matches your domain
   - Verify Redirect URLs include your callback URL

2. ✅ Email Template:
   - Go to Authentication > Email Templates
   - Check "Confirm signup" template is enabled
   - Verify template content and from address

3. ✅ SMTP Configuration:
   - Check if custom SMTP is configured
   - If using Supabase default, check rate limits
   - Verify domain authentication if using custom domain

4. ✅ Client-side Issues:
   - Check browser console for errors
   - Verify emailRedirectTo URL is correct
   - Check if signup actually succeeded (user created?)

5. ✅ Email Provider Issues:
   - Check spam/junk folders
   - Try different email providers (Gmail, Outlook, etc.)
   - Check email delivery logs in Supabase

6. ✅ Rate Limiting:
   - Supabase has rate limits on email sending
   - Wait a few minutes between attempts
   - Check if you hit daily email limits
  `);
};
