import SellerProductForm from '../seller/SellerProductForm';
import { productAdminAPI } from '../../services/api';

export default function ProductAdminProductForm() {
  return <SellerProductForm client={productAdminAPI} basePath="/product-admin/products" />;
}
