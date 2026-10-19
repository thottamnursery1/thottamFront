import SellerProducts from '../seller/SellerProducts';
import { productAdminAPI } from '../../services/api';

export default function ProductAdminProducts() {
  return <SellerProducts client={productAdminAPI} basePath="/product-admin/products" />;
}
