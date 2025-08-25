AWS S3 Next.js File Explorer

This is a Next.js 15
 project that allows users to upload, view, download, and delete files from an AWS S3 bucket. Authentication is handled using Clerk
 for secure user login.

Live demo: https://aws-s3-nextjs-taupe.vercel.app/

Features

Authentication with Clerk

File Management:

Upload files to AWS S3

Download files via presigned URLs

Delete files directly from S3

Folder Management:

Navigate folders and subfolders

Upload files to specific folders

Real-time File Explorer UI with preview for images and text files

Serverless API Routes to handle S3 operations

Getting Started

Clone the repository then -
pnpm install

Create a .env file with your configuration:

NEXT_PUBLIC_CLERK_FRONTEND_API=<your-clerk-frontend-api>
CLERK_API_KEY=<your-clerk-api-key>

AWS_REGION=<your-aws-region>
AWS_BUCKET_NAME=<your-s3-bucket-name>
AWS_ACCESS_KEY=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>

Run the development server:

pnpm run dev
pnpm next

