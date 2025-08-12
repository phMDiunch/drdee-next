// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/services/supabaseClient";

// Auth error messages mapping for better UX
const AUTH_ERROR_MESSAGES = {
  invalid_request: "Yêu cầu xác thực không hợp lệ",
  invalid_grant: "Mã xác thực đã hết hạn hoặc không hợp lệ",
  unauthorized_client: "Ứng dụng không được ủy quyền",
  access_denied: "Quyền truy cập bị từ chối",
  unsupported_response_type: "Loại phản hồi không được hỗ trợ",
  invalid_scope: "Phạm vi quyền không hợp lệ",
  server_error: "Lỗi máy chủ xác thực",
  temporarily_unavailable: "Dịch vụ xác thực tạm thời không khả dụng",
} as const;

// Validate redirect path for security
const isValidRedirect = (path: string, origin: string): boolean => {
  try {
    const url = new URL(path, origin);
    return url.origin === origin;
  } catch {
    return path.startsWith("/") && !path.startsWith("//");
  }
};

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/";

  // Handle OAuth errors from Supabase
  if (error) {
    console.error("OAuth error:", { error, error_description });
    const errorMessage =
      AUTH_ERROR_MESSAGES[error as keyof typeof AUTH_ERROR_MESSAGES] ||
      error_description ||
      "Có lỗi xảy ra trong quá trình xác thực";

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, origin)
    );
  }

  const safeRedirect = isValidRedirect(next, origin) ? next : "/";

  if (code) {
    try {
      // Exchange the code for a session
      const { error: authError } = await supabase.auth.exchangeCodeForSession(
        code
      );

      if (authError) {
        console.error("Auth callback error:", authError);

        // Handle specific Supabase auth errors
        let errorMessage = "Xác thực không thành công";
        if (authError.message.includes("expired")) {
          errorMessage = "Liên kết xác thực đã hết hạn. Vui lòng thử lại.";
        } else if (authError.message.includes("invalid")) {
          errorMessage = "Liên kết xác thực không hợp lệ.";
        } else if (authError.message.includes("already")) {
          errorMessage = "Tài khoản đã được xác thực.";
        }

        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(errorMessage)}`, origin)
        );
      }

      // Success - redirect to intended page
      if (safeRedirect === "/login" || safeRedirect.includes("/login")) {
        const successUrl = new URL("/login", origin);
        successUrl.searchParams.set(
          "success",
          "Xác thực thành công! Bạn có thể đăng nhập ngay."
        );
        return NextResponse.redirect(successUrl);
      }

      return NextResponse.redirect(new URL(safeRedirect, origin));
    } catch (error) {
      console.error("Unexpected auth callback error:", error);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            "Có lỗi hệ thống xảy ra. Vui lòng thử lại sau."
          )}`,
          origin
        )
      );
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent(
        "Liên kết xác thực không hợp lệ hoặc đã hết hạn."
      )}`,
      origin
    )
  );
}
