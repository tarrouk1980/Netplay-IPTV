module.exports = function seoHeaders(req, res, next) {
  res.setHeader('X-Robots-Tag', 'index, follow');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  next();
};
