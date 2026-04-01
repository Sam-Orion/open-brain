"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EMAIL_REGEX, USERNAME_REGEX, PASSWORD_REGEX } from "@/lib/validations";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!email || !username || !password) {
    return { error: "Please provide all required fields" };
  }

  // Validate Email
  if (!EMAIL_REGEX.test(email)) {
    return { error: "Invalid email address format" };
  }

  // Validate Username: lowercase alphanumeric, 3-20 characters
  if (!USERNAME_REGEX.test(username)) {
    return {
      error:
        "Username must be 3-20 characters and contain only lowercase letters and numbers",
    };
  }

  // Validate Password: 8+ chars, at least 1 number, at least 1 special char
  if (!PASSWORD_REGEX.test(password)) {
    return {
      error:
        "Password must be at least 8 characters long and contain at least 1 number and 1 special character",
    };
  }

  const supabase = await createSupabaseServerClient();

  // Call Supabase Auth to Sign Up
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
      // Since it's App Router, email redirects typically land on the callback route.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Successfully signed up! Please check your email to verify your account.",
  };
}

export async function signInAction(formData: FormData) {
  const identifier = formData.get("identifier") as string; // can be username or email
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { error: "Please provide both username/email and password" };
  }

  const supabase = await createSupabaseServerClient();

  let emailToSignIn = identifier;

  // Check if identifier is an email. If not, treat it as a username.
  const isEmail = EMAIL_REGEX.test(identifier);

  if (!isEmail) {
    // Treat as username, look up the email
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", identifier)
      .single();

    if (profileError || !profileData) {
      return { error: "Invalid login credentials" }; // Generic error to obscure existence
    }

    emailToSignIn = profileData.email;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: emailToSignIn,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Invalid login credentials" };
    }
    return { error: error.message };
  }

  // Redirect to dashboard on success
  redirect("/dashboard");
}
