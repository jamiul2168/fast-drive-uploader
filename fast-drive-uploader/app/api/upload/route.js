import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { fileName, fileType } = await request.json();
  
  // এই লাইনটি যোগ করা হয়েছে: অনুরোধের উৎস (Origin) বের করার জন্য
  const origin = request.headers.get('origin');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  try {
    // এই কোডটি পরিবর্তন করা হয়েছে: গুগলকে এখন Origin সম্পর্কে জানানো হচ্ছে
    const res = await drive.files.create(
      {
        requestBody: {
          name: fileName,
          parents: [folderId],
        },
        media: {
          mimeType: fileType,
        },
      },
      {
        // এই অপশনটি নিশ্চিত করে যে আমরা একটি আপলোড সেশন শুরু করছি
        // এবং এর সাথে আমাদের কাস্টম হেডার পাঠাচ্ছি।
        params: {
          uploadType: 'resumable',
        },
        headers: {
          'Origin': origin, // এখানে আমরা ভিসা বা Origin যুক্ত করছি
        },
      }
    );

    // 'location' হেডার থেকে ইউনিক আপলোড লিঙ্কটি পাওয়া যাবে
    const uploadUrl = res.headers.location;

    if (!uploadUrl) {
      throw new Error("Could not get a resumable upload URL.");
    }

    return NextResponse.json({ url: uploadUrl });

  } catch (error) {
    console.error("Error creating resumable upload URL:", error.message);
    return NextResponse.json({ error: 'Failed to create upload session.' }, { status: 500 });
  }
}
