const { connect } = require('../../lib/mongoose');
const Product = require('../../models/Product');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let { id, name, price, image, category } = req.body;
    const idNum = Number(id);

    if (!id) return res.status(400).json({ error: 'id required' });

    await connect();

    const product = await Product.findOneAndUpdate(
      { id: idNum },
      { name, price, image, category },
      { new: true }
    );

    if (!product) return res.status(404).json({ error: 'Mahsulot topilmadi' });

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error('POST /api/products/edit error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
