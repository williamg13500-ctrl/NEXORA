import { config } from 'hatchable';
export const access = 'public';
export const methods = ['GET'];
export default async function (req, res) {
  const [emailAddress, location] = await Promise.all([
    config.get('public_business_email'),
    config.get('business_location')
  ]);
  return res.json({
    email: typeof emailAddress === 'string' ? emailAddress.trim() : '',
    location: typeof location === 'string' ? location.trim() : ''
  });
}