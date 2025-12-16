const { connect } = require('../../lib/mongoose');
const Product = require('../../models/Product');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.body;
    if (typeof id === 'undefined') return res.status(400).json({ error: 'id required' });

    await connect();
    const idNum = Number(id);
    await Product.findOneAndDelete({ id: idNum });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('POST /api/products/delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
