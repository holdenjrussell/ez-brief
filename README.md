# AI Ad Briefing Tool

A web application for managing brand information, target audiences, competitor insights, and creating AI-assisted advertising briefs. This project is in its foundational setup phase.

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase Account
- Vercel Account
- GitHub Account

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/holdenjrussell/ez-brief.git
   cd ez-brief
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file at the project root with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   You can find these values in your Supabase project settings.

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Supabase Setup

1. Create a new project in the [Supabase Dashboard](https://app.supabase.io/).

2. Set up a `profiles` table by running the following SQL in the SQL Editor:

   ```sql
   CREATE TABLE public.profiles (
     id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     full_name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );

   -- Set up Row Level Security
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

   -- Create policy for users to only read/write their own profile
   CREATE POLICY "Users can read own profile" 
     ON public.profiles 
     FOR SELECT 
     USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" 
     ON public.profiles 
     FOR UPDATE 
     USING (auth.uid() = id);

   CREATE POLICY "Users can insert own profile" 
     ON public.profiles 
     FOR INSERT 
     WITH CHECK (auth.uid() = id);
   ```

3. Configure authentication in the Auth section of the Supabase dashboard.

## Vercel Deployment

1. Push your code to GitHub.

2. Connect your GitHub repository to a new Vercel project.

3. Set the following environment variables in your Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy your project. Vercel will automatically build and deploy the application whenever you push changes to the main branch.

## Features

- User authentication (signup, login, logout)
- Protected dashboard
- Basic UI with Shadcn/UI components
- Supabase integration for backend services 