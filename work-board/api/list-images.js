import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dazshqfrn',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  try {
    const result = await cloudinary.search
      .expression('folder:work-board')
      .with_field('context')
      .with_field('metadata')
      .max_results(500)
      .execute();

    const items = result.resources.map(r => ({
      id: r.asset_id,
      url: r.secure_url,
      thumb: r.secure_url.replace('/upload/', '/upload/c_scale,w_300/'),
      metadata: {
        alt: r.context?.alt || '',
        agileTeam: r.metadata?.agileTeam || '',
        assetType: r.metadata?.assetType || '',
        fileName: r.public_id.split('/').pop(),
        status: r.metadata?.status || '',
        user: r.metadata?.user || '',
        fileURL: r.metadata?.fileURL || ''
      }
    }));

    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify(items));
  } catch (err) {
    console.error(err);
    res.status(500).end(JSON.stringify({ error: 'Failed to fetch images' }));
  }
}
