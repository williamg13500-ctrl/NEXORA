export const access = 'admin';
export default async function (req, res) {
  return res.redirect('/admin.html');
}