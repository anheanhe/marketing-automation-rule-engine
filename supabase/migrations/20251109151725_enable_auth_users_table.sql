/*
  # Enable Authentication
  
  1. Security
    - Enable RLS on auth.users (already enabled by Supabase)
    - Create profile table linked to auth.users
    - Add RLS policies for user profiles
  
  2. Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `created_at` (timestamp)
    
  3. Notes
    - Email confirmation is disabled by default in Supabase
    - Users can sign up with email/password
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
