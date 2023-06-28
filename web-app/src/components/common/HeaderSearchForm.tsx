import DeliveryTimeDropdown from './DeliveryTimeDropdown';
import DeliveryAddressSelector from './DeliveryAddressSelector';

export default function HeaderSearchStoresForm() {
 
  return (
    <div className="d-flex gap-4 w-100 justify-content-center">
      <DeliveryTimeDropdown />
      <DeliveryAddressSelector />      
    </div>
  );
}
