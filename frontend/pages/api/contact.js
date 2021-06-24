export default function handler(req, res) {
    if (req.method === 'POST') {
        res.status(200).json({ name: 'Post' })
    } else {
      // Handle any other HTTP method
    }
  }